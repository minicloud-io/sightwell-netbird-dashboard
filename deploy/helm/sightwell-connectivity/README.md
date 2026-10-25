# sightwell-connectivity Helm chart

Deploys Sightwell Connectivity on one domain: the Sightwell dashboard at `/`
and the NetBird server (API, embedded identity provider, relay, signal and
management gRPC) under its paths, with the Sightwell theme on the identity
provider's sign-in, sign-out, password, device and error pages. Only the
dashboard and the server are in scope; the NetBird operator, routing peers
and egress forwarders are unchanged and not part of this chart.

| Component | Image |
| --- | --- |
| Server | `ghcr.io/minicloud-io/sightwell-netbird-server` (NetBird combined server, upstream v0.81.4, plus the `server.auth.theme` setting) |
| Dashboard | `ghcr.io/minicloud-io/sightwell-netbird-dashboard` (NetBird dashboard, upstream v2.95.0, Sightwell presentation layer) |

## Install

```bash
# both packages are private: a pull secret in the target namespace
kubectl -n netbird create secret docker-registry ghcr-sightwell \
  --docker-server=ghcr.io --docker-username=<github-user> --docker-password=<token with read:packages>

cat > values.yaml <<'YAML'
domain: connectivity.example.internal
imagePullSecrets:
  - name: ghcr-sightwell
server:
  image:
    tag: v0.81.4-sightwell.6
    digest: sha256:4ab658e5d133f46256d92d916c11347ba09c6a37fbdd588fa4075f8e6f552161
  authSecret: "<openssl rand -base64 32>"
  store:
    encryptionKey: "<openssl rand -base64 32>"
  auth:
    sessionCookieEncryptionKey: "<openssl rand -hex 16>"
  persistence:
    storageClass: ""            # cluster default
  extraConfig:
    reverseProxy:
      trustedHTTPProxiesCount: 1   # one ingress hop in front of the server
dashboard:
  image:
    tag: v2.95.0-sightwell.3-rootless
    digest: sha256:4fe5ba369bd97fd3c2502bad481ae1c503c3b3c01588f9742b506663f7ea696f
ingress:
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
YAML

helm upgrade --install connectivity ./sightwell-connectivity -n netbird --create-namespace -f values.yaml
```

Then open `https://<domain>/` and complete the first-administrator wizard
(or set `server.auth.owner`). Peers use
`netbird up --management-url https://<domain>`.

Secrets in `values.yaml`: keep that file out of git, or pass the three keys
with `--set` from your secret store. The chart renders them into a Secret
named `<release>-server-config`; with `server.existingConfigSecret` you can
supply the whole `config.yaml` yourself and the chart only adds the theme
mounts.

## What the chart renders

- `Secret <release>-server-config`: `config.yaml` for the combined server
  (listen on :80 plain + h2c, TLS at the ingress; issuer and redirect URIs
  derived from `domain`; local STUN off, since an HTTP ingress cannot carry
  UDP; `server.extraConfig` merged verbatim).
- `ConfigMaps <release>-idp-templates / -idp-static / -idp-theme`: the
  Sightwell theme from `files/idp-theme`. They are combined by **one
  projected volume** into `/etc/netbird/idp-theme` with the layout Dex
  expects (`templates/`, `static/`, `themes/<name>/`, `robots.txt`), so
  there is no file-level `subPath` mount that could land on a directory.
  Switched on with `server.auth.theme`. From server `v0.81.4-sightwell.4`
  the directory is read into memory at start (kubelet's `..data` entries
  skipped), so the mount layout no longer matters to Dex; the projected
  layout is kept because it is the simplest to reason about.
- `Deployment <release>-server` (1 replica, `Recreate`, PVC for
  `/var/lib/netbird`) and `Service`.
- `Deployment <release>-dashboard` (rootless image, UID 10001) and
  `Service`, with the environment NetBird's getting-started uses for the
  embedded IdP plus `SIGHTWELL_DOCS_URL` (`dashboard.docsUrl`) and
  `SIGHTWELL_HIDE_INTEGRATIONS` (`dashboard.hideIntegrations`).
- Two `Ingress` objects for ingress-nginx: HTTP (`/api`, `/oauth2`,
  `/relay`, `/ws-proxy` to the server, `/` to the dashboard) and gRPC with
  `backend-protocol: GRPC` (`/management.ManagementService`,
  `/signalexchange.SignalExchange`, `/management.ProxyService`), the route
  split from NetBird's reverse-proxy layout. Another ingress controller
  needs the equivalent h2c setting for the gRPC paths.
- `ConfigMap <release>-native-signin` (only with `nativeSignIn.entra.enabled`):
  `sightwell-signin.json`, mounted into the dashboard's web root and served
  at `/.well-known/sightwell-signin.json`; a checksum annotation rolls the
  dashboard pod when it changes.

## Theme files

`files/idp-theme` is a copy of `deploy/idp-theme`; run `../sync-theme.sh`
after changing the theme. The server refuses to start, naming the item, if
the mounted directory lacks a required template, `static/`, `themes/<name>/`
or the `robots.txt` file (all of which Dex itself needs). Check a mount
from inside the pod with `kubectl exec <server pod> -- ls -R /etc/netbird/idp-theme`.

## Native sign-in on iOS

The Sightwell iOS app can sign users in with Microsoft Entra directly
(Microsoft Authenticator, or Microsoft's own sign-in sheet) instead of the
browser page. The app gets an Entra ID token and the device exchanges it at
the embedded IdP for a NetBird token (RFC 8693, public client
`netbird-cli`, no secret on the phone). Same NetBird user as the browser
sign-in, so existing devices and permissions carry over. Entra MFA and
conditional access apply, because Microsoft does the sign-in.

Requirements: the embedded IdP with an Entra connector (Settings >
Identity Providers in the dashboard). Nothing changes on the server or in
Dex: the connector type supports token exchange and NetBird allows every
grant type on it.

1. **Entra** (the app registration the connector uses, Entra admin centre >
   App registrations > that app > Authentication): add the platform
   **iOS / macOS** with bundle ID `ai.sightwell.connectivity.ios`. Entra
   creates the redirect URI `msauth.ai.sightwell.connectivity.ios://auth`.
   "Allow public client flows" is not needed. Optional: a conditional access
   policy for this app requiring a compliant device.
2. **Chart values**, then `helm upgrade`:

   ```yaml
   nativeSignIn:
     entra:
       enabled: true
       tenantId: <Entra directory (tenant) ID>
       clientId: <application (client) ID of that app registration>
       connectorId: <connector ID shown in the dashboard>
   ```

3. **Check**: `curl -s https://<domain>/.well-known/sightwell-signin.json`
   returns the three values (public identifiers, no secrets).
4. **Users**: on the next Connect the app shows Authenticator or
   Microsoft's sheet. Without the file, or if native sign-in fails, the app
   offers the browser sign-in.

Turn it off with `enabled: false`; the app falls back to the browser
sign-in at the next sign-in.

## Upgrades and rollback

Bump the two image tags and digests (release notes of each repository list
them) and `helm upgrade`. `helm rollback` restores the previous images; the
server's data lives on the PVC and is not touched by either. Never change
`server.store.encryptionKey` for an existing store.

## Not covered

- The NetBird operator's own resources and CRDs.
- External STUN/TURN: set `server.stuns` to reachable servers for peers that
  need them.
- Postgres for the stores: set `server.store.engine`/`dsn` and
  `authStore`/`activityStore` through `server.extraConfig` as NetBird documents.
