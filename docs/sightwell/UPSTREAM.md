# Upstream baseline and modifications

## Baseline

| | |
| --- | --- |
| Upstream | https://github.com/netbirdio/dashboard (remote `upstream`) |
| Tag | `v2.95.0` |
| Commit | `0d020d44a1d94135a6b71098ddb3efb1237f3b4d` |
| Selected | 2026-10-24 |
| Working branch | `feat/sightwell-branding` |

### Why this commit

The deployment pins `netbirdio/dashboard:latest`, which identifies no
commit. On 2026-10-24 Docker Hub resolved `latest` to digest
`sha256:3d6adfee19dd8d34d795af51daee69d27d2081d2076a5a304cfdd14acc67d6f4`
(multi-arch index) whose image config carries
`org.opencontainers.image.version=v2.95.0` and
`org.opencontainers.image.revision=0d020d44a1d94135a6b71098ddb3efb1237f3b4d`.
That is the newest release at the time and the most likely deployed one.

**Not verified:** the digest actually running in the customer's cluster. If
the cluster pulled `latest` before 2026-10-15 it runs an older release, and
production compatibility of this branch with that server is unverified.
`RELEASE.md` explains how to read the running digest and record it as the
rollback target.

Routing-peer version `0.72.4` says nothing about the dashboard version. The
branding proposal in netbirdio/dashboard#853 is **not** in `v2.95.0`: the
tree has no branding configuration, so this fork adds its own.

## Modifications (2026-10-24)

Modified upstream files (keep this list current; it is the AGPL §5(a)
record together with git history):

| File | Change |
| --- | --- |
| `tailwind.config.ts` | palette values for `gray`, `nb-gray`, `netbird` |
| `next.config.js` | `NEXT_PUBLIC_SIGHTWELL_SOURCE_URL`, `NEXT_PUBLIC_SIGHTWELL_REVISION` |
| `src/utils/meta.ts` | title from `BRAND.fullName` |
| `src/app/layout.tsx` | description from `BRAND.description` |
| `src/app/favicon.ico`, `src/app/apple-icon.png` | replaced |
| `src/components/NetBirdLogo.tsx` | shim rendering `BrandLogo` |
| `src/components/Button.tsx` | `primary` variant text colour |
| `src/layouts/Header.tsx` | `BrandLogo mobile module surface="theme"` |
| `src/layouts/Navigation.tsx` | About sidebar item |
| `src/components/ui/HelpAndSupportButton.tsx` | rewritten menu |
| `src/contexts/AnnouncementProvider.tsx` | feed URL from `BRAND.announcementsUrl` (empty = off) |
| `.storybook/main.ts` | defines the feed URL for the AnnouncementBanner stories |
| `src/auth/SessionLost.tsx`, `src/auth/OIDCError.tsx`, `src/app/error/page.tsx`, `src/app/invite/page.tsx` | `BrandIcon`, `BrandFooter`, copy |
| `src/modules/instance-setup/InstanceSetupWizard.tsx` | welcome copy, footer |
| `src/modules/users/PendingApproval.tsx` | support link replaced, footer |
| `src/app/PublicPages.stories.tsx` | expected welcome text |
| `build.sh` | image name, `SIGHTWELL_REVISION`, writes `out/third-party-licenses.txt` |
| `docker/Dockerfile.ubi` | image labels |
| `docker/README.md`, `README.md` | fork notice prepended |

Added files:

| File | Purpose |
| --- | --- |
| `src/branding/brand.ts` (+ `brand.test.ts`) | identity, upstream record, URL helpers |
| `src/branding/BrandLogo.tsx`, `BrandIcon.tsx`, `BrandFooter.tsx`, `Branding.stories.tsx` | components |
| `src/assets/sightwell/*` (+ `README.md`) | brand SVGs |
| `src/app/icon.svg` | SVG favicon |
| `src/app/(dashboard)/about/{layout,page}.tsx`, `About.stories.tsx` | About page |
| `.github/workflows/sightwell-image.yml` | the fork's image and release workflow (upstream's `build_and_push.yml` is unchanged and disabled in the fork) |
| `NOTICE.md`, `docs/sightwell/*` | notices and this documentation |

Nothing else moved: routes, API calls, permissions, forms, OIDC, the nginx
config, `config.json` and `init_react_envs.sh` are upstream's.

## Upgrade procedure

1. `git fetch upstream --tags` and pick the release the deployment will run
   (read the image labels as in `RELEASE.md`).
2. `git switch -c feat/sightwell-branding-<tag> <tag>` and
   `git cherry-pick <fork commits>` (or rebase the branch onto the tag). The
   commits are small and touch the files above; conflicts land in
   `tailwind.config.ts` (new tokens upstream), `Navigation.tsx`,
   `HelpAndSupportButton.tsx` and `Header.tsx`.
3. Update `UPSTREAM.baselineTag` / `baselineCommit` in `src/branding/brand.ts`,
   the table above and `NOTICE.md`.
4. Re-run the branding inventory: `grep -rn "NetBirdLogo\|NetBirdIcon\|Welcome to NetBird\|forms.gle\|docs.netbird.io/slack" src`
   and decide each new hit (product identity → brand component; technology →
   leave).
5. `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run test:unit`,
   `npm run build`, `BASE_REF=<tag> npm run test:visual` and review every
   difference against `BRANDING.md`.
6. Capture before/after screenshots (`VALIDATION.md`) and tag the release
   (`RELEASE.md`).

Upstream workflows that assume NetBird's infrastructure (`build_and_push.yml`,
`bump-netbird.yml`, `sync-deploy-templates.yml`, `e2e-test.yml`,
`docs-ack.yml`) are untouched; they fail or do nothing without NetBird's
secrets. `build_and_push.yml` and `sync-deploy-templates.yml` must be
disabled in the fork's Actions settings as soon as GitHub registers them
(see `RELEASE.md`; not deleted, to keep the diff small); the fork builds
images with `sightwell-image.yml`.
