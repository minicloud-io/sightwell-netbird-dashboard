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
    tag: v0.81.4-sightwell.4
    digest: sha256:8baf1cce26f7b90dd95e29f068dfa17d35615f49b45a54bcddc31aa834999c09
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
    tag: v2.95.0-sightwell.2-rootless
    digest: sha256:d8f90643efed6cf417a9ecb21934bf3c6b86a24fe2458e5b347bf2efc8eabf6f
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
  embedded IdP.
- Two `Ingress` objects for ingress-nginx: HTTP (`/api`, `/oauth2`,
  `/relay`, `/ws-proxy` to the server, `/` to the dashboard) and gRPC with
  `backend-protocol: GRPC` (`/management.ManagementService`,
  `/signalexchange.SignalExchange`, `/management.ProxyService`), the route
  split from NetBird's reverse-proxy layout. Another ingress controller
  needs the equivalent h2c setting for the gRPC paths.

## Theme files

`files/idp-theme` is a copy of `deploy/idp-theme`; run `../sync-theme.sh`
after changing the theme. The server refuses to start, naming the item, if
the mounted directory lacks a required template, `static/`, `themes/<name>/`
or the `robots.txt` file (all of which Dex itself needs). Check a mount
from inside the pod with `kubectl exec <server pod> -- ls -R /etc/netbird/idp-theme`.

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
