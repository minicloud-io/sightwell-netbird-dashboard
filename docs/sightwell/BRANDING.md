# Sightwell Connectivity branding

How the NetBird dashboard is presented as **Sightwell Connectivity**: the
identity used, where it comes from, the tokens, the surfaces it touches and
the configuration that carries it. Everything here is fork-specific; the
upstream project does not know about it.

## Identity

Sightwell has an established identity (the `sightwell.ai` site and the
Sightwell console pages). It is the source of truth; nothing here is a new
proposal.

| Element | Value | Source |
| --- | --- | --- |
| Product name | **Sightwell** (brand) / **Connectivity** (module); browser title `Sightwell Connectivity` | brief |
| Vendor | KeyBeyond | brief |
| Ink | `#111417` | `sightwell.ai/assets/css/site.css` |
| Paper | `#F2F0EB` (app surfaces `#F7F6F2`, `#EFEDE7`) | same |
| Signal orange | `#F07A3A` (text on light: `#B4430F`, deep `#8A320A`) | same |
| Lines | light `#D6D2C8` / `#DDD9D0`, dark `#2A2F34` / `#30353B` | same |
| Wordmark | Archivo Expanded Bold, **outlined in the SVG** (no font shipped) | `sightwell-logo*.svg` |
| Text | IBM Plex Sans on the site; **Inter kept here** (see Fonts) | — |
| Mark | sight-glass: ink ring with eight bolts, white glass, orange horizon | `sightwell-mark*.svg` |
| Radius | 6 px on the site; the dashboard's `rounded-md` (6 px) matches | — |
| Module chip | mono, uppercase, letter-spacing 0.08em, 1 px border (same chip as the console's context badge) | `sightwell-console-signin.html` |

Status colours (green, red, yellow, blue) are upstream's and are **not** the
accent; "Non-compliant", "Pending", "Expired" and the peer status dots keep
their own hues plus icons and labels.

## Assets

All brand files are bundled; nothing loads from a CDN.

| File | Used by |
| --- | --- |
| `src/assets/sightwell/sightwell-logo(-reversed).svg` | `BrandLogo` (header, About, setup wizard, onboarding, pending approval) |
| `src/assets/sightwell/sightwell-mark(-reversed).svg` | `BrandIcon` ≥ 33 px (invite screen) |
| `src/assets/sightwell/sightwell-icon-small(-reversed).svg` | `BrandIcon` ≤ 32 px (session lost, errors) and the mobile header |
| `src/app/icon.svg` | favicon (SVG, follows `prefers-color-scheme`) |
| `src/app/favicon.ico` | favicon fallback, 16/32/48 px, built from the site's PNGs |
| `src/app/apple-icon.png` | Apple touch icon, 180 px |

Rights: the files are KeyBeyond/Sightwell's own. They are trademarks and are
not licensed under the AGPL; `src/assets/sightwell/README.md` says so for
anyone redistributing the source.

## Tokens

The dashboard styles everything with Tailwind classes against three named
scales in `tailwind.config.ts`. The fork changes the **values** and keeps the
**names**, so no component changes and an upstream upgrade only re-applies
the config:

| Token | Upstream meaning | Sightwell value |
| --- | --- | --- |
| `netbird` / `netbird-50…950` | the accent (NetBird orange `#f68330`) | signal orange `#F07A3A`, ramp 50 `#FFF5EE` → 950 `#3D1504`, 700 `#B4430F` |
| `nb-gray` / `nb-gray-50…960` | dark-theme neutrals (cool, `#181a1d` base) | ink ramp: DEFAULT/950 `#111417`, 940 `#15181B`, 930 `#1E2226`, 900 `#2A2F34`, 800 `#3A3F45`, 400 `#8C9197`, 300 `#A3A7AD`, 100 `#E4E6E9`, 50 `#F2F0EB` |
| `gray-50…900` | light-theme neutrals | paper ramp: 50 `#F7F6F2`, 100 `#EFEDE7`, 200 `#DDD9D0`, 300 `#CFCAC0`, 500 `#585C61`, 700 `#30353B`, 900 `#111417` |

One shared component changed: the `primary` Button variant now uses ink text
on the orange (`text-nb-gray-950`), as the site's buttons do. White on
`#F07A3A` is 2.9:1 and fails AA; ink on it is 7.6:1.

### Light and dark

Upstream v2.95.0 ships `class="dark"` on `<html>` and a theme switch
(`ThemeProvider`, key `netbird-theme`, values dark / light / system). At this
baseline **only the header and sidebar are styled for light**; page content,
cards, modals and the pre-login screens use `nb-gray` without `dark:`
prefixes and stay dark in both themes (compare
`screenshots/before/pages-core-peers--list--light.png`). The fork keeps that
behaviour unchanged. The brand components therefore take a `surface` prop:

- `surface="theme"`: both variants in the DOM, toggled by the `dark` class
  (the header);
- `surface="dark"` (default): reversed assets, for every always-dark surface;
- `surface="light"`: for a light surface, when upstream finishes light mode.

Finishing light mode across the app is an upstream-sized change and is out of
scope here (`HANDOFF.md`).

## Fonts

The dashboard bundles Inter (`src/assets/fonts/Inter.ttf`, OFL) through
`next/font/local`. It stays: it is self-hosted, licensed, already tuned for
the dense tables, and the brief asks to reuse existing fonts. The wordmark
needs no font. Switching body text to IBM Plex Sans (OFL, also
redistributable) would mean adding ~300 KB of font files and re-checking
every table for metric changes; it is listed as an option in `HANDOFF.md`,
not done.

## Surface inventory

| Surface | Owner | What changed |
| --- | --- | --- |
| Browser title | `src/utils/meta.ts` (`globalMetaTitle`) and the per-route `layout.tsx` files that prefix it | "Sightwell Connectivity" |
| Meta description | `src/app/layout.tsx` | from `BRAND.description` |
| Favicon / touch icon | `src/app/icon.svg`, `favicon.ico`, `apple-icon.png` | Sightwell set |
| Header lockup | `src/layouts/Header.tsx` → `BrandLogo mobile module surface="theme"` | lockup + CONNECTIVITY chip; mark only below `md` |
| Product lockup elsewhere | `src/components/NetBirdLogo.tsx` (shim → `BrandLogo`) | setup wizard, onboarding, pending approval, AWS plan page (cloud only) |
| Product mark | `src/branding/BrandIcon.tsx` | session lost, OIDC error, error page, invite |
| NetBird technology mark | `src/assets/icons/NetBirdIcon.tsx` | **unchanged** where it marks the NetBird client/server: peer version cell, posture checks, SSH instructions, owner role, invites table |
| Sidebar | `src/layouts/Navigation.tsx` | "About" item added under Documentation; "Documentation" points at `SIGHTWELL_DOCS_URL`; "Integrations" hidden unless `SIGHTWELL_HIDE_INTEGRATIONS=false` |
| Help menu | `src/components/ui/HelpAndSupportButton.tsx` | Documentation (`SIGHTWELL_DOCS_URL`), NetBird technical reference, client troubleshooting, NetBird community forum, About, Source code; NetBird Slack and the feedback form removed |
| Add-device modal | `src/modules/setup-netbird-modal/SightwellAppActions.tsx`, `src/utils/sightwellApp.ts` | above the OS tabs, for user devices only: "Open in Sightwell app" (`sightwell://add-profile?name=<name>&url=https://<tenant host>`, which the desktop and iPhone apps confirm and then add, select and sign in) and "Download profile for IT (macOS)", a `.mobileconfig` built in the browser with fresh UUIDs that sets only `managementURL` under `ai.sightwell.connectivity`. The tenant is `NETBIRD_MGMT_GRPC_API_ENDPOINT`, else the page origin; https only, so neither shows on `http://localhost` (see the `Modules/Setup/SightwellAppActions` story) |
| Announcements | `src/contexts/AnnouncementProvider.tsx` | remote NetBird banners off (`BRAND.announcementsUrl` empty); `NETBIRD_ANNOUNCEMENT` and billing notices still work; Storybook sets the feed URL so the banner stories render |
| About page | `src/app/(dashboard)/about/` | new: identity, build, AGPL offer, help |
| Source offer footer | `src/branding/BrandFooter.tsx` | setup wizard, invite, session lost, OIDC error, error page, pending approval |
| Copy | `error/page.tsx`, `invite/page.tsx`, `InstanceSetupWizard.tsx`, `PendingApproval.tsx` | "Welcome to Sightwell Connectivity", "account administrator", no NetBird support desk link |
| Version block | `src/components/VersionInfo.tsx`, `src/utils/version.ts` | fork versions shown in full (`v2.95.0-sightwell.3`), fork builds compared by build number, "Update available" links to the fork's releases; the server reports latest versions from the fork repositories when `server.updates` is set |
| Loading | `src/components/ui/FullScreenLoading.tsx` → `src/branding/BrandSpinner.tsx` | Sightwell mark with a turning signal-orange arc instead of upstream's bouncing bars; stops under reduced motion |
| Sign-in, sign-out, password, device and error pages | **NetBird server (embedded Dex)**, not the dashboard | themed in `deploy/idp-theme/`; activated by `server.auth.theme` in the Sightwell server fork (see its README) |
| Primary button | `src/components/Button.tsx` | ink text on orange |
| Palette | `tailwind.config.ts` | see Tokens |
| Image metadata | `docker/Dockerfile.ubi`, `sightwell-image.yml` labels | Sightwell names; AGPL and third-party notices unchanged |

Left as NetBird on purpose: install instructions and `netbird up` commands,
"NetBird IP Address" on the peer page, "Get Started with NetBird" empty
state, "Delete NetBird account", posture check names, docs links, package
names, environment variables, API paths and all licence text.

## Configuration

Build time (baked into the static export):

| Variable | Default | Purpose |
| --- | --- | --- |
| `SIGHTWELL_SOURCE_URL` | `https://github.com/minicloud-io/sightwell-netbird-dashboard` | repository linked from About and the footer; must be http(s) or the default is used |
| `SIGHTWELL_REVISION` | `git rev-parse HEAD`, else `development` | commit the source links pin to |
| `SIGHTWELL_ANNOUNCEMENTS_URL` | empty (off) | optional hosted announcements feed, http(s) only; the origin must also be allowed with `NETBIRD_CSP` |
| `NEXT_PUBLIC_DASHBOARD_VERSION` | `development` | upstream's; shown in the sidebar and About |

`next.config.js` exposes them as `NEXT_PUBLIC_SIGHTWELL_*`; `src/branding/brand.ts`
validates them and derives the tree, licence and modifications URLs
(GitHub URL layout). Nothing is injected into HTML as a raw string: values
are rendered by React, URLs are parsed before use.

Runtime (`config.json`, `docker/init_react_envs.sh`), fork-specific additions
next to the `NETBIRD_*` settings; the brand itself stays a build-time
property of the image:

| Variable | Default | Purpose |
| --- | --- | --- |
| `SIGHTWELL_DOCS_URL` | `https://sightwell.ai/connectivity` | where the sidebar "Documentation", the help menu's "Documentation" and the About page's primary documentation button point; http(s) only, anything else falls back to the default. NetBird's technical reference stays reachable from the help menu and About as "NetBird technical reference" |
| `SIGHTWELL_TENANT_NAME` | empty | organisation name the "Open in Sightwell app" link and the IT profile carry (e.g. "Alder Cove Energy"); empty derives one from the host's first label (`aldercove-energy` becomes "Aldercove Energy") |
| `SIGHTWELL_HIDE_INTEGRATIONS` | `true` | hides the Integrations menu (NetBird Cloud's integrations surface); only the string `false` shows it. The route itself is not removed |

Read through `src/branding/runtime.ts` (`docsUrl()`, `hideIntegrations()`, `tenantName()`).
The Helm chart sets them from `dashboard.docsUrl`, `dashboard.hideIntegrations` and `dashboard.tenantName`.

## Storybook

`Components/Branding` shows the lockup, chip, mark and source offer in both
themes; `Pages/Platform/About` renders the About page. `npm run storybook`,
toolbar switches theme and self-hosted/cloud.
