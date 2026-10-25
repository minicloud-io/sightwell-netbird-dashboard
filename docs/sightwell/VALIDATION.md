# Validation

What was run on `feat/sightwell-branding` (baseline upstream `v2.95.0`,
commit `0d020d44a1d94135a6b71098ddb3efb1237f3b4d`) on 2026-10-24, on a
developer Mac (Node 24.7.0, npm 11.6.4; the repository requires Node ≥ 24),
and what was not.

## Environment and setup

| Step | Result |
| --- | --- |
| `git clone … && git remote rename origin upstream && git fetch upstream --tags` | fresh clone at `/Users/richard/Projects/MINICLOUD/sightwell-netbird-dashboard` |
| `git switch --detach v2.95.0 && git switch -c feat/sightwell-branding` | baseline checked out |
| `npm ci` | 767 packages, exit 0, lockfile unchanged |
| `npx playwright install chromium` | pinned headless Chromium 147 (v1217) for the visual check |
| Docker Hub query for `netbirdio/dashboard:latest` | digest `sha256:3d6adfee…`, labels `version=v2.95.0`, `revision=0d020d44…` |

No production setup keys, API tokens, customer data or cluster access were
used or requested. The cluster's running digest was **not** read.

## Checks on the branch

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | clean (after `next build` generated `next-env.d.ts`; before that the only errors were upstream's missing image-module declarations) |
| `npm run lint` | 171 errors / 322 warnings in 89 files, **all pre-existing**: the error rules are `react-hooks/refs`, `react-hooks/set-state-in-effect`, `react-hooks/preserve-manual-memoization`, `react-hooks/static-components`, `react-hooks/immutability`, `react/no-unescaped-entities` in untouched files. The two errors in touched files (`src/app/error/page.tsx:33`, `src/auth/OIDCError.tsx:27`, `set-state-in-effect`) exist identically on the baseline (verified with `git stash`). New files lint clean. |
| `npm run test:unit` | 907 tests passed (41 files), including the new `src/branding/brand.test.ts` and the existing `PendingApproval.test.tsx` that mocks `NetBirdLogo` |
| `npm run build` | compiled, 56 static pages, `postbuild.js` ran; `out/` contains `about.html`, `favicon.ico`, `icon.svg`, `apple-icon.png`; `<title>Sightwell Connectivity</title>` on `/`, `Peers - …`, `About - …` |
| `npm run storybook` | all 687 stories index, including the new `Components/Branding` (2) and `Pages/Platform/About` (1) |
| `BASE_REF=v2.95.0 npm run test:visual` | see "Visual regression" below |

## Screenshots

`screenshots/before/` (upstream `v2.95.0`) and `screenshots/after/` (this
branch), 1440 × 900, dark and light, taken from the running Storybook with
Playwright (the same story-ready detection as the repository's capture
script). **Every screenshot is mock-backed**: the data is the repository's
Storybook fixtures, not a backend.

| Story | Flow |
| --- | --- |
| `pages-core-peers--list`, `--empty`, `--row-action-menu` | peers table, empty state, row menu |
| `pages-core-peer--server` | peer detail |
| `pages-core-layout--help-menu`, `--user-dropdown`, `--collapsed-sidebar` | shell, help menu, account menu, collapsed navigation |
| `pages-network-networks--list` | networks |
| `pages-network-access-control--list`, `--create-policy-modal` | policies, policy modal |
| `pages-core-groups--list` | groups |
| `pages-core-settings--setup-keys`, `--authentication`, `--danger-zone` | setup keys, settings, destructive zone |
| `pages-core-team--users` | users |
| `pages-platform-public--setup`, `--invite`, `--install`, `--error`, `--error-user-blocked`, `--error-pending-approval` | pre-login and error screens |
| `pages-platform-about--default` | About page (new) |
| `components-branding--logo`, `--source-offer` | brand pieces (new) |

Not captured: toasts, loading skeletons and the disconnected state have no
dedicated page stories; they take the brand through the shared tokens
(`Notification.stories`, `skeletons/`) and were checked by eye in Storybook,
not recorded.

## Visual regression

`BASE_REF=v2.95.0 CAPTURE_CONCURRENCY=4 npm run test:visual` (dark theme,
the tool's default; every story is affected because `tailwind.config.ts`
changed), two full runs plus one filtered re-run:

| Run | Result |
| --- | --- |
| 1 (before the header fix) | 351 changed, 429 unchanged, 5 new, 7 only in baseline; 1020 s |
| 2 (final code) | **347 changed, 433 unchanged, 5 new, 7 only in baseline**; 914 s |
| 3 `--filter components-announcementbanner` (after the Storybook config fix) | 4 changed, 3 unchanged, none missing; 22 s |

Judgement, following `.storybook/visual-regression/CLAUDE.md`:

- **Intended (347):** every change is the palette (ink neutrals, signal
  orange, ink text on primary buttons), the Sightwell lockup/mark, the new
  footer on pre-login screens, the About sidebar item or the rewritten help
  menu. Largest crops reviewed: invite screens (mark, copy, footer),
  reverse-proxy cluster install steps, agent-network onboarding, cloud
  integrations "locked" callouts, network route rows, help menu, settings
  danger zone, primary button hover. No layout moved, nothing is clipped,
  no state disappeared.
- **Regression found and fixed:** run 1 and 2 listed the seven
  `Components/AnnouncementBanner` stories as "only in the baseline". Cause:
  the fork disables the remote announcements feed, and those stories drive
  the banner through that feed (mocked). Fix in tooling, not stories:
  `.storybook/main.ts` injects upstream's feed URL into
  `src/branding/brand.ts` for Storybook only (the same transform upstream
  uses to mock `config.ts`). Run 3 confirms the stories render; their only
  difference is the palette.
- **New (5):** `Components/Branding` (2), `Pages/Platform/About` (1), and
  the two `Pages/Platform/Public / Setup*` stories, which failed to capture
  on the baseline side in both runs (the "2 failed" in the baseline capture
  log, a baseline-side timeout) and therefore have no baseline here; their
  before state is in `screenshots/before/pages-platform-public--setup--*.png`
  from the manual capture.
- **Not run through the tool:** the light theme (`--theme light`). Light is
  covered by the manual before/after shots only; upstream's light mode is
  incomplete at this baseline (see below), so a tool run would mostly report
  the same palette change on dark page content.

The full report is `.storybook/visual-regression/output/report.html` (not
committed; the folder is git-ignored).

## Dependency security bumps (2026-10-25)

Dependabot on the fork reported 3 critical and 3 high alerts, all in
`package-lock.json` and all inherited from upstream `v2.95.0`: `next`
(GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r), `storybook`
(GHSA-f2ph-cmg5-wxc8, GHSA-px85-f4q5-jh77) and `undici` (GHSA-xjj6-f33q-929c),
plus two medium ones in `@vitest/mocker`. The patched versions listed in
`UPSTREAM.md` were installed; `npm audit` additionally flagged
`brace-expansion` (high, dev), `source-map-js` (high, build) and
`ip-address` (moderate, runtime), which were bumped too. Left open:
`postcss-selector-parser` (moderate, build-time only), whose fix needs
Tailwind 4, a breaking change that belongs to upstream. After the bumps: `npm run build` compiles, `npm run test:unit`
907/907, `npx tsc --noEmit` clean, `npx storybook build` produces all 687
stories. Not re-run after the bumps: the full visual regression pass and the
e2e suite.

## Loading spinner and identity-provider theme (2026-10-25)

- `BrandSpinner` replaces the bouncing bars in `FullScreenLoading`; checked in
  Storybook (`Components/Branding / Spinner`, `Components/UI/EmptyStates /
  Loading`), type check and lint clean, unit tests unchanged (907).
- `deploy/idp-theme/` was rendered with hand-filled template variables and
  screenshotted (`idp-login`, `idp-logout`, `idp-password-error`, dark and
  light).
- Served by a real server on 2026-10-25: the Sightwell server fork image
  `ghcr.io/minicloud-io/sightwell-netbird-server:v0.81.4-sightwell.1` was
  started locally with `server.auth.theme` pointing at a mount of this
  directory. The embedded Dex initialised, the page it served had
  `<title>Sightwell Connectivity</title>`, the Sightwell lockup and no
  "netbird" text, and `theme/favicon.svg` answered 200. A theme directory
  without `static/` made Dex refuse to start ("failed to load web static"),
  which is why the start-up validation now requires it; a missing directory
  fails on boot with "embedded IdP frontend dir … no such file or
  directory". Not exercised: a full sign-in through a connector.
- Server `v0.81.4-sightwell.4` was run against a theme directory laid out
  like a ConfigMap mounted at `templates/` (`..data` symlink,
  `..<timestamp>` directory, symlinked files); `.3` fails on it with
  "read templates/..data: is a directory", `.4` starts, serves the
  Sightwell-titled page and the theme favicon.

## Known limitations and pre-existing issues

- **Light theme** (upstream): only the header and sidebar are styled for
  light at v2.95.0; page content, cards, modals and pre-login screens stay
  dark, and page headings use `text-gray-700` on that dark surface (dim
  "13 Peers" in `before/pages-core-peers--list--light.png` and after). The
  fork does not change this; `HANDOFF.md` lists it.
- **Light-theme help button** (upstream): the `default-outline` button
  variant has no light styles, so the "?" button is faint in the light
  header before and after.
- **Lint**: 171 pre-existing errors (above); not touched to keep the diff
  reviewable.
- **Storybook stories that fail to capture on both sides** (2 of 684 in the
  baseline run, upstream flakiness, see the summary).

## Not tested

- **End-to-end** (`npm run test`): needs the Docker test environment
  (`npm run test:setup`, Zitadel) which was not started. Flows touched that
  an e2e run should cover: setup wizard, invite acceptance, sign-in error
  paths, help menu, About page navigation.
- **Real authentication**: the OIDC flow, the embedded IdP sign-in page and
  session handling are unchanged in code and were **not** exercised; the
  branded error and session screens were rendered with mocked auth state
  only.
- **Production compatibility**: the baseline matches today's Docker Hub
  `latest`, not a verified reading of the cluster. A build passing here
  proves nothing about the management server version the cluster runs.
- **Image build** (`./build.sh`, the three Dockerfiles, CI): not executed;
  the changes to `build.sh` were syntax-checked (`bash -n`) and the workflow
  YAML edited by hand. The UBI `/licenses` copy and the
  `out/third-party-licenses.txt` step are unverified.
- **Keyboard navigation and screen readers**: focus rings and roles are
  upstream's; the new About page uses the same Button, Card and link
  components, but no assistive-technology pass was done.
- **Mobile**: the narrow header (mark only, chip hidden) was checked at
  375 px in the browser; no other mobile layouts were reviewed.
