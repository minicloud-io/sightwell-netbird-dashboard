const { execSync } = require("child_process");

// Fork-specific (Sightwell Connectivity): the About page and the pre-login
// footer offer the complete corresponding source of the exact build. CI passes
// SIGHTWELL_REVISION (the commit) and may override SIGHTWELL_SOURCE_URL; a
// local build reads the commit from git and otherwise reports "development".
function gitRevision() {
  try {
    return execSync("git rev-parse HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  env: {
    APP_ENV: process.env.APP_ENV || "production",
    NEXT_PUBLIC_DASHBOARD_VERSION:
      process.env.NEXT_PUBLIC_DASHBOARD_VERSION || "development",
    NEXT_PUBLIC_SIGHTWELL_SOURCE_URL:
      process.env.SIGHTWELL_SOURCE_URL ||
      "https://github.com/minicloud-io/sightwell-netbird-dashboard",
    NEXT_PUBLIC_SIGHTWELL_REVISION:
      process.env.SIGHTWELL_REVISION || gitRevision() || "development",
    // Empty: no remote announcements feed (see src/branding/brand.ts).
    NEXT_PUBLIC_SIGHTWELL_ANNOUNCEMENTS_URL:
      process.env.SIGHTWELL_ANNOUNCEMENTS_URL || "",
  },
};

module.exports = nextConfig;
