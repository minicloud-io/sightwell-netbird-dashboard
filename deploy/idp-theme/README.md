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

## Status: ready, but not switchable on today

Dex loads a custom web directory when its `frontend.dir` is set, and
NetBird's Dex wrapper passes that through
(`idp/dex/config.go`, `ToServerConfig`: `Dir: c.Frontend.Dir`, falling back
to the embedded files only when it is empty). The management server,
however, builds that config itself from `management.json`'s `EmbeddedIdP`
section and hard-codes the frontend
(`management/server/idp/embedded.go`, `ToYAMLConfig`:
`Frontend: dex.Frontend{Issuer: "NetBird", Theme: "light"}`), with no field
to set a directory. So with the current `netbirdio/netbird-server` image
**there is no configuration that activates this theme**. The server is out
of scope for this fork and is not modified here.

### The upstream change that would enable it

A small, backwards-compatible addition to `EmbeddedIdPConfig` (the exact
field names are a proposal for the pull request):

```go
// management/server/idp/embedded.go
type EmbeddedIdPConfig struct {
    // …existing fields…
    // Frontend overrides the look of the sign-in pages. Empty keeps NetBird's.
    Frontend *EmbeddedIdPFrontend `json:"Frontend,omitempty"`
}

type EmbeddedIdPFrontend struct {
    Dir     string `json:"Dir"`     // directory with templates/, static/, themes/
    Theme   string `json:"Theme"`   // theme folder under Dir/themes (default "light")
    Issuer  string `json:"Issuer"`  // page title / issuer name (default "NetBird")
    LogoURL string `json:"LogoURL"` // optional logo URL for themes that use it
}

// in ToYAMLConfig():
frontend := dex.Frontend{Issuer: "NetBird", Theme: "light"}
if c.Frontend != nil {
    if c.Frontend.Dir != ""     { frontend.Dir = c.Frontend.Dir }
    if c.Frontend.Theme != ""   { frontend.Theme = c.Frontend.Theme }
    if c.Frontend.Issuer != ""  { frontend.Issuer = c.Frontend.Issuer }
    if c.Frontend.LogoURL != "" { frontend.LogoURL = c.Frontend.LogoURL }
}
cfg.Frontend = frontend
```

Dex already validates and serves the directory; nothing else changes. With
that merged, `management.json` gains:

```json
"EmbeddedIdP": {
  "Enabled": true,
  "Issuer": "https://connectivity.example.internal/oauth2",
  "Frontend": { "Dir": "/etc/netbird/idp-theme", "Theme": "sightwell", "Issuer": "Sightwell Connectivity" }
}
```

Until then the choices are: (a) submit that pull request upstream and wait
for a release, (b) run a patched server build, which this project has
decided against, or (c) sign in through the external identity provider
directly (set the dashboard's `AUTH_AUTHORITY` to Entra ID) so the Dex page
is never shown, at the cost of the embedded IdP's local "Continue with
Email" users.

## Mounting on Kubernetes (once the server supports it)

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
