# Release, source delivery and rollback

## Versioning

- Fork tags: `v<upstream>-sightwell.<n>`, e.g. `v2.95.0-sightwell.1`. The
  upstream part names the baseline; `n` counts fork releases on it. The
  scheduled sync (below) creates these tags itself; a manual release is
  `git tag -a v2.95.0-sightwell.2 -m "…" && git push origin v2.95.0-sightwell.2`
  from the reviewed commit on `main`.
- `main` is the release line: baseline release plus the branding. It is not
  tracking upstream `main`; the sync moves it from release tag to release
  tag.
- `NEXT_PUBLIC_DASHBOARD_VERSION` is set from the tag by CI (upstream's
  mechanism) and shown in the sidebar and on About.
- `SIGHTWELL_REVISION` is the commit; the About page and footer link
  `<source url>/tree/<commit>`. `SIGHTWELL_SOURCE_URL` defaults to the fork
  repository; CI sets it from `github.server_url/github.repository`.

## Image build

The build path is upstream's: `next build` static export → nginx image.

CI is the fork's own workflow, `.github/workflows/sightwell-image.yml`:

| Trigger | Result |
| --- | --- |
| push of a tag `v*` | `ghcr.io/minicloud-io/sightwell-netbird-dashboard:<tag>` plus `-rootless` and `-ubi`, `latest` (and `latest-rootless`, `latest-ubi`), `sha-<short>`; a GitHub release with the source archive and third-party notices |
| push to `main` | the same images tagged `main` (+ variants) and `sha-<short>` |
| manual run (workflow_dispatch) | build only; tick **push** to publish |

It builds `linux/amd64` and `linux/arm64`, bakes `SIGHTWELL_REVISION` and
`SIGHTWELL_SOURCE_URL` from the run, writes the third-party notices into the
export and the UBI `/licenses`, and prints every digest in the run summary.
The images carry OCI labels from `docker/metadata-action`
(`org.opencontainers.image.revision`, `.source`, `.version`) plus the
Sightwell title, vendor and licence labels. It needs no secrets beyond the
workflow's `GITHUB_TOKEN` (`packages: write`, `contents: write`).

Every action it uses is pinned to a commit SHA with the release in a
comment (`actions/checkout@3d3c42e… # v7.0.1`), and the fork's Actions
settings require SHA pinning, so an unpinned `uses:` fails to run.
`.github/dependabot.yml` opens monthly PRs that move the pins; review the
release notes of each bump before merging.

Upstream's `build_and_push.yml` is kept unchanged for easy upgrades but
must stay **disabled in the fork's Actions** (it publishes NetBird's images
with NetBird's secrets), as must `sync-deploy-templates.yml`. GitHub only
registers a fork's workflows once Actions first runs them, so disable both
right after the first push to `main` (or the first time they show up in
`gh workflow list --repo minicloud-io/sightwell-netbird-dashboard`):

```bash
gh workflow disable build_and_push.yml --repo minicloud-io/sightwell-netbird-dashboard
gh workflow disable sync-deploy-templates.yml --repo minicloud-io/sightwell-netbird-dashboard
```

Re-check after each upstream merge. A tag pushed from a feature branch runs
`sightwell-image.yml` from that tag without merging to `main` first, which
is the way to trial the pipeline (use a `-rc` tag).

## Staying current with upstream

`.github/workflows/sightwell-sync-upstream.yml` runs every Monday 05:17 UTC
and on demand (optionally with a specific upstream tag). When upstream has a
release newer than `UPSTREAM.baselineTag` in `src/branding/brand.ts` it:

1. merges that release tag into `main` on a `sync/upstream-<tag>` branch;
2. rewrites the baseline tag and commit in `brand.ts` and the table in
   `UPSTREAM.md`, in one commit;
3. runs `npm ci`, `npm run build` and `npm run test:unit`;
4. on success pushes `main`, tags `v<tag>-sightwell.<n>` and dispatches the
   image workflow on the tag, which publishes the images and the release.

On a merge conflict it aborts and opens an issue listing the conflicting
files; on a failed build or test it pushes the sync branch and opens an
issue with the run link. Nothing reaches `main` in either case. The sync
does not judge visual changes: after each automated release, run
`BASE_REF=<previous fork tag> npm run test:visual` and look at the branded
surfaces (`BRANDING.md` inventory) before pointing a deployment at the new
digest. Both workflows need only the repository `GITHUB_TOKEN`.

Locally, `./build.sh` (`IMAGE_TAG=v2.95.0-sightwell.1 ./build.sh`) builds
`out/`, writes `out/third-party-licenses.txt`, builds the amd64 image and
exports a tarball. `ROOTLESS=1` builds the 8080/UID 10001 variant that the
Kubernetes deployment should use.

## Corresponding source

The fork is AGPL-3.0. Users interacting with the dashboard get the offer on
the About page and on every pre-login screen. For it to be true for a
deployed image:

1. Tag the exact commit that was built and push the tag to the public
   repository. The image's `org.opencontainers.image.revision` label, the
   About page's "Fork revision" and the tag must agree.
2. The repository at that tag contains everything needed to rebuild: source,
   `package-lock.json`, `build.sh`, the Dockerfiles, nginx config and
   `docs/sightwell/`. No customer values are in it; deployment configuration
   (IdP, API endpoint, CSP additions) is passed as environment variables at
   runtime and must stay out of the repository.
3. Third-party notices: `out/third-party-licenses.txt` (linked from About as
   `/third-party-licenses.txt`) and `/licenses/` inside the UBI image, both
   generated by `docker/third-party-licenses.mjs` from the lockfile.
4. Offline installations: ship the image tarball together with the
   `…-source.tar.gz` and `third-party-licenses.txt` the workflow attaches
   to the GitHub release of that tag, so the source offer does not depend on
   network access to GitHub. Keep the archive for as long as the
   image is in use (the licence asks for three years after the last
   distribution).

Open questions for review, not resolved here: whether the Sightwell
trademark notice in `src/assets/sightwell/README.md` is the wording legal
wants; whether KeyBeyond wants the About page to name a legal entity;
whether any customer-specific CSP domains or announcement text ever end up
in a committed file (they must not).

## Deployment: replace only the dashboard image

The deployment runs `netbirdio/dashboard:latest`. Change it to a versioned
tag **and** an immutable digest:

```yaml
image: ghcr.io/minicloud-io/sightwell-netbird-dashboard:v2.95.0-sightwell.1@sha256:<digest from the registry>
```

The digest is in the workflow run summary; it can also be read with:

```bash
docker buildx imagetools inspect ghcr.io/minicloud-io/sightwell-netbird-dashboard:v2.95.0-sightwell.1
```

To cut a release: `git tag v2.95.0-sightwell.1 && git push origin v2.95.0-sightwell.1`
(from the commit that was reviewed), then wait for the "Sightwell image" run.

Nothing else changes: the server, operator, routing peers, forwarder,
PostgreSQL, ingress, environment variables and the identity provider stay as
they are. The dashboard container is stateless; rolling it is a normal
`kubectl rollout` of that one Deployment. **None of this was executed from
this branch.**

Before the first rollout, compare the running server version with the
dashboard baseline: the About page cannot do that (it needs no API), but the
sidebar version block (`/instance/version`) shows both once signed in. If the
management server is older than what `v2.95.0` expects, upgrade the server
first or pick an older baseline (`UPSTREAM.md`).

## Server image for the themed sign-in pages

The sign-in, sign-out, password, device and error pages come from the NetBird
server, not the dashboard. Theming them needs the Sightwell server fork's
image (`minicloud-io/sightwell-netbird-server`, upstream `v0.81.4` plus the
`server.auth.theme` setting) in place of `netbirdio/netbird-server`:

| | |
| --- | --- |
| Image | `ghcr.io/minicloud-io/sightwell-netbird-server:v0.81.4-sightwell.1@sha256:311c0b8e9bae21d24c97cecf37a21d3109cee17f971701ecc934a38a77cc9d33` |
| Platforms | linux/amd64, linux/arm64 |
| Config | `server.auth.theme: {dir: /etc/netbird/idp-theme, name: sightwell, displayName: "Sightwell Connectivity"}` in the server's `config.yaml` |
| Theme files | `deploy/idp-theme/` from this repository, mounted as in its README |

This is a change to the server workload, outside the "replace only the
dashboard image" scope of the dashboard rollout above; treat it as its own
change with its own rollback (the previous `netbirdio/netbird-server`
digest, read the same way as below). Without the `theme` block the fork's
server behaves exactly like upstream's, so the image can be rolled first
and the theme switched on afterwards.

## Rollback

Record the digest the cluster runs **before** the change; it is the rollback
target and nothing here invents it:

```bash
kubectl -n <namespace> get deploy <dashboard> -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
kubectl -n <namespace> get pod -l <selector> -o jsonpath='{.items[0].status.containerStatuses[0].imageID}{"\n"}'
```

| | |
| --- | --- |
| Current fork release | `v2.95.0-sightwell.2` (commit `b5b15d87`, built 2026-10-25 by run 40172605075): branded loading spinner, dependency security fixes |
| → standard | `ghcr.io/minicloud-io/sightwell-netbird-dashboard:v2.95.0-sightwell.2@sha256:e933bba506f8a226f4e3ba9751f59fd94b68c3d2f27c360353ea9b3be4277c8e` |
| → rootless | `ghcr.io/minicloud-io/sightwell-netbird-dashboard:v2.95.0-sightwell.2-rootless@sha256:d8f90643efed6cf417a9ecb21934bf3c6b86a24fe2458e5b347bf2efc8eabf6f` |
| → ubi | `ghcr.io/minicloud-io/sightwell-netbird-dashboard:v2.95.0-sightwell.2-ubi@sha256:ede5482c0b0baa527d4813a8f697b4f42647d3661f367210a7d035943d668f9a` |
| First fork release | `v2.95.0-sightwell.1` (commit `0b2ed3221423689505710a1e22f814a13b24dfbb`, built 2026-10-25 by run 40159917842) |
| → standard | `ghcr.io/minicloud-io/sightwell-netbird-dashboard:v2.95.0-sightwell.1@sha256:18bd73b79da9aeae87e605053810820cc1def7652350a9d3f536f0cfea2cdec8` |
| → rootless | `ghcr.io/minicloud-io/sightwell-netbird-dashboard:v2.95.0-sightwell.1-rootless@sha256:75e95967fe94afdbbd9e1db15ce4f4c0485585f0b196a68550722bc5d7a84921` |
| → ubi | `ghcr.io/minicloud-io/sightwell-netbird-dashboard:v2.95.0-sightwell.1-ubi@sha256:72af615c5cb600340117e88c8ce69a880f7590ff83790579a7359af922212138` |
| Previous image | `netbirdio/dashboard:latest` |
| Previous digest (running in the cluster) | **not read, record before rollout** |
| Docker Hub `latest` on 2026-10-24 | `netbirdio/dashboard@sha256:3d6adfee19dd8d34d795af51daee69d27d2081d2076a5a304cfdd14acc67d6f4` (= `v2.95.0`) |

Rollback is setting the image back to the recorded digest and rolling the
Deployment. The dashboard keeps no state, so no data migration is involved in
either direction.
