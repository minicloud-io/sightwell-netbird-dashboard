# Sightwell theme for the NetBird embedded identity provider

The sign-in, sign-out, password, device and error pages a user sees before the
dashboard loads are **not** served by the dashboard. They come from the NetBird
server's embedded identity provider (Dex), whose templates live in
`netbirdio/netbird` under `idp/dex/web/` and are compiled into the server
binary. This directory is a complete replacement for that web directory in
the Sightwell identity, so the sign-in experience matches the dashboard and
the Sightwell console pages:

```
deploy/idp-theme/
├── templates/   all 13 Dex templates; header.html, footer.html, logout.html,
│                home.html and webauthn_verify.html are Sightwell's, the rest
│                are upstream's unchanged (they only use the shared CSS classes)
├── static/      main.css (empty, as upstream's)
├── themes/sightwell/   favicon.svg, favicon.ico, favicon.png, logo.png, styles.css
└── robots.txt
```

Design: ink / paper neutrals with the signal-orange accent, 6 px radius, a
4 px accent rule on the panel, the lockup with the CONNECTIVITY chip, the OS
colour scheme respected, no external fonts or images (the wordmark is an
inline outlined SVG). Provider icons (Entra ID, Google, Okta, …) are
upstream's data URIs, kept verbatim. Previews rendered from these templates:
`docs/sightwell/screenshots/after/idp-*.png`.

## Status: switched on through the Sightwell server fork

Dex loads a custom web directory when its `frontend.dir` is set, and
NetBird's Dex wrapper passes that through
(`idp/dex/config.go`, `ToServerConfig`). The upstream management server
never exposes it: `management/server/idp/embedded.go` hard-codes
`Frontend{Issuer: "NetBird", Theme: "light"}`. So with the official
`netbirdio/netbird-server` image this theme cannot be activated.

The Sightwell server fork, `minicloud-io/sightwell-netbird-server` (branch
`feat/idp-theme` on upstream `v0.81.4`), adds the missing plumbing as a
`server.auth.theme` block; see `docs/sightwell/README.md` there. A server image built from that fork is published, see `docs/sightwell/RELEASE.md`
("Server image for the themed sign-in pages"); with it:

```yaml
server:
  auth:
    issuer: "https://connectivity.example.internal/oauth2"
    theme:
      dir: /etc/netbird/idp-theme
      name: sightwell
      displayName: "Sightwell Connectivity"
```

The server validates the directory at start-up (it must contain
`templates/header.html`, `footer.html`, `login.html`, `logout.html`,
`password.html`, `error.html` and `themes/sightwell/`), which this
directory does. Without the block, or with the upstream image, NetBird's
own pages are served as before. The alternative that needs no server
change remains signing in through the external identity provider directly
(dashboard `AUTH_AUTHORITY` pointed at Entra ID), at the cost of the
embedded IdP's local "Continue with Email" users.

## Mounting on Kubernetes

The theme is plain files; a ConfigMap per folder keeps each under the 1 MiB
limit (the favicon is binary, `--from-file` handles it):

```bash
kubectl -n <namespace> create configmap sightwell-idp-templates --from-file=deploy/idp-theme/templates
kubectl -n <namespace> create configmap sightwell-idp-theme     --from-file=deploy/idp-theme/themes/sightwell
kubectl -n <namespace> create configmap sightwell-idp-static    --from-file=deploy/idp-theme/static --from-file=deploy/idp-theme/robots.txt
```

```yaml
volumes:
  - { name: idp-templates, configMap: { name: sightwell-idp-templates } }
  - { name: idp-theme,     configMap: { name: sightwell-idp-theme } }
  - { name: idp-static,    configMap: { name: sightwell-idp-static } }
containers:
  - name: netbird-server
    volumeMounts:
      - { name: idp-templates, mountPath: /etc/netbird/idp-theme/templates, readOnly: true }
      - { name: idp-theme,     mountPath: /etc/netbird/idp-theme/themes/sightwell, readOnly: true }
      - { name: idp-static,    mountPath: /etc/netbird/idp-theme/static, readOnly: true }
```

`robots.txt` ends up under `static/`; Dex serves it from `Dir/robots.txt`,
so either mount it there separately or accept the default.

## Keeping it in step with upstream

Only five templates differ from upstream. After each server upgrade, diff
`idp/dex/web/templates` at the new tag against the unchanged files here
(`approval`, `device`, `device_success`, `error`, `login`, `oob`, `password`,
`totp_verify`) and copy them over; re-check that `header.html` still defines
every `nb-*` class the new templates use.

## Licences

The templates are derived from `netbirdio/netbird` `idp/dex/web/`, which is
under the BSD 3-Clause License, Copyright (c) NetBird GmbH; the notice is
reproduced in `LICENSE-NETBIRD-TEMPLATES`. The Sightwell wordmark, mark and
favicons are trademarks and are not licensed for reuse outside Sightwell
deployments (see `src/assets/sightwell/README.md`).

## Verification

The pages were rendered from these templates with the template variables
filled in by hand (`issuer`, `url`, connectors) and screenshotted in both
colour schemes. They were **not** served by a running Dex, so Go template
syntax errors would only show up at server start; the five changed templates
use only the constructs upstream's already used (`{{ template }}`,
`{{ issuer }}`, `{{ url .ReqPath "…" }}`, `{{ if .BackURL }}`).
