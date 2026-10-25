/**
 * Sightwell Connectivity branding (fork-specific).
 *
 * This fork of the NetBird dashboard is presented as "Sightwell Connectivity",
 * the connectivity module of the Sightwell platform. Everything that names the
 * product, points at its source code or decides which upstream (NetBird)
 * surfaces stay visible lives in this module, so an upstream upgrade only has
 * to re-apply it and the call sites listed in docs/sightwell/UPSTREAM.md.
 *
 * Build-time values come from next.config.js (NEXT_PUBLIC_SIGHTWELL_*).
 * Runtime deployment settings stay in config.json / docker/init_react_envs.sh.
 */

/** The upstream project this fork is built from. Bump on every upgrade. */
export const UPSTREAM = {
  name: "NetBird dashboard",
  vendor: "NetBird GmbH",
  repository: "https://github.com/netbirdio/dashboard",
  license: "AGPL-3.0",
  licenseName: "GNU Affero General Public License v3.0",
  baselineTag: "v2.95.0",
  baselineCommit: "0d020d44a1d94135a6b71098ddb3efb1237f3b4d",
} as const;

const DEFAULT_SOURCE_URL =
  "https://github.com/minicloud-io/sightwell-netbird-dashboard";

/**
 * A build-time URL is only used when it parses as http(s); anything else falls
 * back to the default, so a mistyped environment variable can never inject an
 * arbitrary href into the About page or the pre-login footer.
 */
export const safeHttpUrl = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback;
    return url.href.replace(/\/+$/, "");
  } catch {
    return fallback;
  }
};

const FULL_SHA = /^[0-9a-f]{40}$/i;

/** A revision string that names a commit, i.e. a full git SHA. */
export const isCommitRevision = (revision: string) => FULL_SHA.test(revision);

/** "0d020d44a1d9…" → "0d020d4"; anything else passes through. */
export const shortRevision = (revision: string) =>
  isCommitRevision(revision) ? revision.slice(0, 7) : revision;

/**
 * The repository tree for the exact revision this build was made from. Only
 * a commit SHA can be pinned; a development build links the repository root.
 * The GitHub URL layout is assumed; see docs/sightwell/RELEASE.md.
 */
export const sourceTreeUrl = (sourceUrl: string, revision: string) =>
  isCommitRevision(revision) ? `${sourceUrl}/tree/${revision}` : sourceUrl;

/** A file inside the source tree at the exact revision (GitHub layout). */
export const sourceFileUrl = (
  sourceUrl: string,
  revision: string,
  path: string,
) =>
  isCommitRevision(revision)
    ? `${sourceUrl}/blob/${revision}/${path}`
    : `${sourceUrl}/blob/HEAD/${path}`;

export const BRAND = {
  productName: "Sightwell",
  moduleName: "Connectivity",
  fullName: "Sightwell Connectivity",
  vendor: "KeyBeyond",
  description:
    "Sightwell Connectivity connects industrial sites, collectors and enterprise systems inside the customer's own infrastructure. It is a Sightwell-branded adaptation of the open-source NetBird dashboard.",
  /** Where the complete corresponding source of this build is published. */
  sourceUrl: safeHttpUrl(
    process.env.NEXT_PUBLIC_SIGHTWELL_SOURCE_URL,
    DEFAULT_SOURCE_URL,
  ),
  /** The fork commit this build was made from ("development" when unknown). */
  revision: process.env.NEXT_PUBLIC_SIGHTWELL_REVISION || "development",
  /**
   * Upstream fetches NetBird's marketing announcements from its GitHub
   * repository at runtime. They advertise NetBird Cloud features and do not
   * apply to a Sightwell deployment, so the fork ships with no remote
   * announcements: only the operator's NETBIRD_ANNOUNCEMENT banner (and the
   * billing notices) remain. An operator who wants a hosted announcements
   * feed sets SIGHTWELL_ANNOUNCEMENTS_URL at build time (http(s) only) and
   * allows that origin in the CSP via NETBIRD_CSP.
   */
  announcementsUrl: safeHttpUrl(
    process.env.NEXT_PUBLIC_SIGHTWELL_ANNOUNCEMENTS_URL,
    "",
  ),
  /**
   * Links that genuinely document the NetBird technology the deployment runs
   * on. They stay, labelled as NetBird's, because the client, server and APIs
   * are NetBird's. No Sightwell documentation or support URL is invented here.
   */
  links: {
    documentation: "https://docs.netbird.io/",
    troubleshooting: "https://docs.netbird.io/help/troubleshooting-client",
    communityForum: "https://forum.netbird.io/",
  },
  /**
   * The third-party notices file that build.sh / CI write into the static
   * export next to the app (docker/third-party-licenses.mjs). Served by nginx
   * from the image; absent on a bare `next dev`.
   */
  thirdPartyNoticesPath: "/third-party-licenses.txt",
} as const;

/**
 * Fork releases are tagged v<upstream>-sightwell.<n>. The label lets the
 * version helpers keep that suffix visible and compare fork builds of the
 * same upstream release by <n> (upstream's helpers drop everything after
 * the release numbers).
 */
export const FORK_RELEASE_LABEL = "sightwell";

/** Where the dashboard's own releases (and upgrade notes) are published. */
export const brandReleasesUrl = () => `${BRAND.sourceUrl}/releases`;

export const brandSourceTreeUrl = () =>
  sourceTreeUrl(BRAND.sourceUrl, BRAND.revision);
export const brandLicenseUrl = () =>
  sourceFileUrl(BRAND.sourceUrl, BRAND.revision, "LICENSE");
export const brandModificationsUrl = () =>
  sourceFileUrl(BRAND.sourceUrl, BRAND.revision, "docs/sightwell/UPSTREAM.md");
