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
| `src/components/ui/FullScreenLoading.tsx` | renders `BrandSpinner` instead of `LoadingIcon` |
| `config.json`, `docker/init_react_envs.sh`, `src/utils/config.ts`, `.storybook/mocks/config.ts` | runtime settings `SIGHTWELL_DOCS_URL`, `SIGHTWELL_HIDE_INTEGRATIONS` |
| `src/modules/onboarding/{Onboarding,OnboardingIntent,OnboardingEnd,OnboardingDevices,OnboardingPolicy,OnboardingSurvey}.tsx`, `src/modules/onboarding/p2p/*.tsx`, `src/modules/onboarding/networks/*.tsx` | first-run onboarding copy (2026-10-28, see BRANDING.md) |
| `src/components/NoPeersGettingStarted.tsx`, `src/modules/activity/ActivityTable.tsx` | empty-state title from `BRAND.fullName` |
| `src/app/(dashboard)/peers/Peers.stories.tsx`, `e2e/tests/onboarding-form.spec.ts` | expected onboarding and empty-state text |
| `src/components/VersionInfo.tsx`, `src/utils/version.ts` | fork version display, fork build comparison, release link |
| `src/app/PublicPages.stories.tsx` | expected welcome text |
| `build.sh` | image name, `SIGHTWELL_REVISION`, writes `out/third-party-licenses.txt` |
| `docker/Dockerfile.ubi` | image labels |
| `docker/README.md`, `README.md` | fork notice prepended |
| `package.json`, `package-lock.json` | security bumps on 2026-10-25 (Dependabot critical/high on the fork): `next` 16.3.4 → 16.4.3, `eslint-config-next` 16.3.0 → 16.4.3, `storybook` and `@storybook/nextjs-vite` 10.6.1 → 10.6.3, `vitest` 4.1.10 → 4.1.12 (for `@vitest/mocker`), transitive `undici` → 7.30.1, `brace-expansion` → 5.0.12, `source-map-js` → 1.2.2, `ip-address` 10.2 → 10.7.5. Build, unit tests and a Storybook build pass; upstream will carry its own bumps, so expect these lines to conflict on the next sync and take upstream's versions when they are at least as new |

Added files:

| File | Purpose |
| --- | --- |
| `src/branding/brand.ts` (+ `brand.test.ts`) | identity, upstream record, URL helpers |
| `src/branding/BrandLogo.tsx`, `BrandIcon.tsx`, `BrandFooter.tsx`, `BrandSpinner.tsx`, `Branding.stories.tsx` | components |
| `src/branding/runtime.ts` | reads the `SIGHTWELL_*` deployment settings |
| `deploy/idp-theme/*` | Sightwell theme for the NetBird server's embedded identity provider (templates derived from netbirdio/netbird, BSD-3-Clause) |
| `src/assets/sightwell/*` (+ `README.md`) | brand SVGs |
| `src/app/icon.svg` | SVG favicon |
| `src/app/(dashboard)/about/{layout,page}.tsx`, `About.stories.tsx` | About page |
| `src/modules/onboarding/Onboarding.stories.tsx` | Storybook stories for the regular onboarding steps |
| `.github/workflows/sightwell-image.yml` | the fork's image and release workflow (upstream's `build_and_push.yml` is unchanged and disabled in the fork) |
| `.github/workflows/sightwell-sync-upstream.yml` | on-demand merge of the latest upstream release into `main`, baseline bump, build, test, tag (no schedule) |
| `.github/dependabot.yml` | keeps the workflows' action pins current |
| `NOTICE.md`, `docs/sightwell/*` | notices and this documentation |

Nothing else moved: routes, API calls, permissions, forms, OIDC, the nginx
config, `config.json` and `init_react_envs.sh` are upstream's.

## Upgrade procedure

The sync workflow (`RELEASE.md`, "Staying current with upstream"), when
dispatched, does steps 1 to 5 for a clean merge and opens an issue
otherwise. It has no schedule and cannot run until `main` carries the fork,
so for now upgrades are done by hand:

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
