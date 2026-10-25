# Engineering handoff

Status of the Sightwell Connectivity branding on `feat/sightwell-branding`
(baseline upstream `v2.95.0`), what is left, and who owns the parts that are
not in this repository.

## Implemented

Everything in the surface inventory of `BRANDING.md` is implemented and
builds (`npm run build`), with unit tests and stories; see `VALIDATION.md`
for what was run. In short:

- application shell: title, favicon set, header lockup with the
  CONNECTIVITY chip, sidebar About item, help menu;
- palette: Sightwell ink / paper / signal orange through the existing
  `nb-gray`, `gray` and `netbird` tokens, so every table, filter, form,
  modal, destructive confirmation, toast, loading, empty, disconnected,
  error and permission-denied state picks the brand up without being
  touched;
- product-identity screens: setup wizard, invite, session expired, OIDC
  error, access error / blocked / pending approval, each with the mark and
  the AGPL source offer footer;
- About page (`/about`) with build info, the source-code offer pinned to the
  build commit, licence, third-party notices and modifications links;
- release plumbing: fork revision and source URL baked in at build time,
  third-party notices written into the static export, image labels, and the
  fork's own `sightwell-image.yml` workflow publishing to the fork's GHCR
  (`RELEASE.md`).

Mock-backed: every screenshot in `screenshots/` comes from Storybook with
the repository's fixtures (`.storybook/mocks`). No backend, IdP or customer
data was used. The example peers (`router-berlin`, `olivias-macbook-pro`,
`owner@netbird.io`) are upstream's fixtures; the synthetic industrial names
from the brief (`alder-cove-collector-01`, `plant-edge-router-01`,
`engineering-workstation-02`) were not substituted into upstream's fixture
files to keep the diff small. Doing so is a 20-line change in
`.storybook/mocks/fixtures/core-data.ts` if the design review wants it.

## Not done, by design

| Item | Why | Where it would go |
| --- | --- | --- |
| Complete light theme | Upstream v2.95.0 styles only the header and sidebar for light; page content is dark in both themes (hundreds of `nb-gray` classes without `dark:` prefixes). Finishing it is an upstream-sized change, not branding. | Upstream, or a separate fork PR once upstream's light mode lands |
| IBM Plex Sans body font | Inter is bundled, licensed and metric-tuned for the tables; the wordmark is outlined. Swapping adds ~300 KB and a full visual re-check. | `src/layouts/AppLayout.tsx` (`localFont`), `.storybook/preview.tsx`, `docker/third-party-licenses.mjs` (`staticTerms`) |
| Renaming peers, networks, routes | The brief forbids it; the terminology is NetBird's and correct. | — |
| Runtime branding switch | The brand is a build-time property of the image; a runtime switch would need new config plumbing in `init_react_envs.sh` and `config.json`. | not planned |
| Dropping the GitHub release check | `src/utils/version.ts` asks `api.github.com` for the latest NetBird client release (the "update available" arrow on peers). It is about the NetBird client and stays. | — |
| Hotjar / GA / HubSpot code paths | Cloud-only, inert without the `NETBIRD_*` ids. Untouched. | — |

## Remaining work

1. **Fork and branch are up.** The public fork
   `https://github.com/minicloud-io/sightwell-netbird-dashboard` was created
   on 2026-10-25 with `gh repo fork netbirdio/dashboard --org minicloud-io
   --fork-name sightwell-netbird-dashboard --clone=false` (this `gh` rejects
   `--remote=false` together with a repository argument), `origin` points at
   it, `upstream` is fetch-only (`git remote set-url --push upstream no_push`)
   and `feat/sightwell-branding` is pushed. Never push to `netbirdio/dashboard`.
2. **Review the branch** on the fork (one commit on top of `v2.95.0`); open a
   pull request against the fork's own `main` when it is accepted, never
   against upstream.
3. **Read the running dashboard digest** from the cluster and record it in
   `RELEASE.md` as the rollback target.
4. **Design review** of the screenshots in both themes; decide on the
   synthetic fixture names and the Plex font option above.
5. **Fixture names** (optional, see above).
6. **E2E** against an isolated test backend (`npm run test:setup`, needs
   Docker and the Zitadel test environment) for the flows touched: setup
   wizard, invite, sign-in error paths, help menu, About page. Not run here.
7. **Legal check** of `NOTICE.md`, the About page wording and the trademark
   note; the dependency notices come from upstream's script unchanged.

## Sign-in pages: who owns what

Each page a user can see before the dashboard renders, and who owns its
branding:

| Page | Owner | Status |
| --- | --- | --- |
| Loading / redirect while the OIDC flow runs (`FullScreenLoading`) | dashboard | spinner now brand orange; no logo by design (sub-second) |
| Sign-in form | **NetBird server's embedded IdP** (`netbirdio/netbird-server`, Dex-based "embedded identity provider" in this deployment) or the customer's external IdP (`AUTH_AUTHORITY`) | **not changed**; a mockup here would not change the real page |
| Session expired, OIDC error, access error / blocked / pending approval | dashboard | branded |
| Instance setup wizard (`/setup`, first admin) | dashboard | branded |
| Invite acceptance (`/invite?token=`) | dashboard | branded |
| Public install page (`/install`) | dashboard | upstream install modal unchanged (it installs the NetBird client); branded title and favicon |
| Change password modal (local users) | dashboard | branded through tokens |

### Visual specification for the externally owned sign-in page

To be applied by whoever owns the IdP page (NetBird server's embedded IdP
theme, or the external IdP's branding settings). It mirrors the existing
Sightwell console sign-in template
(`KeyBeyond.Infrastructure.Supabase/modules/oauth2_proxy_studio/templates/sightwell-sign_in.html`),
so the two sign-in experiences match:

- background: paper `#F2F0EB` with a 48 px grid line pattern in `#DAD8D2`
  (dark: `#111417`, lines `#2A2F34`); honour `prefers-color-scheme`;
- centred Sightwell lockup (32 px mark + wordmark) above a 440 px panel,
  white (dark `#1A1E22`), 1 px line border, 6 px radius, 4 px signal-orange
  top border, 32 px padding;
- context chip "CONNECTIVITY" in mono uppercase above the heading
  (`font: 500 11px IBM Plex Mono; letter-spacing .08em`);
- heading in Archivo Expanded Bold 28 px ("Sign in to continue."), body in
  IBM Plex Sans 15 px, muted `#585C61` (dark `#A3A7AD`);
- primary button full width, 44 px, ink background `#111417` with paper
  text (dark: paper background, ink text); provider buttons keep the
  provider's own mark; focus ring 2 px signal orange, 3 px offset;
- footer line in 12 px muted: product name, "Built on the NetBird
  dashboard (AGPL-3.0)", and a "Source code" link to the deployed
  revision, the same offer the dashboard shows;
- error and denied variants: panel top border `#B4430F`, status chip in
  the same colour, no red text on orange.

Nothing about the IdP configuration changes: authority, client id, redirect
URIs, scopes, token handling, session lifetime and MFA stay as deployed. A
branded sign-in page is cosmetic and proves nothing about the integration.

## Ownership summary

| Area | Owner |
| --- | --- |
| This repository, `docs/sightwell/`, image build | Sightwell platform engineering (KeyBeyond) |
| NetBird server, operator, routing peers, forwarder, PostgreSQL | unchanged, platform team; out of scope |
| Embedded IdP sign-in page | NetBird server configuration (platform team) |
| External IdP sign-in page | customer identity team |
| Brand assets | Sightwell brand owner (`sightwell.ai` repository) |
