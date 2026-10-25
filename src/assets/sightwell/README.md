# Sightwell brand assets (fork-specific)

These files are the Sightwell identity used by this fork of the NetBird
dashboard. They come from the Sightwell brand asset set (`sightwell.ai`
site repository, `assets/img/`) and are reproduced here so the dashboard
builds without any external image or font CDN.

| File | Use |
| --- | --- |
| `sightwell-logo.svg` / `sightwell-logo-reversed.svg` | Primary lockup (mark + outlined wordmark) on light / dark surfaces. No font dependency. |
| `sightwell-mark.svg` / `sightwell-mark-reversed.svg` | Sight-glass mark alone, 33 px and above. |
| `sightwell-icon-small.svg` / `sightwell-icon-small-reversed.svg` | Simplified mark (no bolts) for 32 px and below. |

Favicons live next to the Next.js app router conventions: `src/app/icon.svg`
(adapts to the OS colour scheme), `src/app/favicon.ico` (16/32/48) and
`src/app/apple-icon.png` (180 px).

Brand rules: clear space of half the mark's height on every side; minimum
lockup height 24 px; never recolour the signal orange (`#F07A3A`).

**Licence note.** The dashboard source is AGPL-3.0 (see `/LICENSE`). The
Sightwell name, wordmark and mark are trademarks of their owner and are
**not** licensed under the AGPL. Redistributions of this source that are not
operated by or for Sightwell should replace these files; see
`docs/sightwell/BRANDING.md`.
