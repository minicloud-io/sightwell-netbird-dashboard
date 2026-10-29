// Sightwell fork: one-click tenant set-up for the Sightwell apps.
//
// The desktop and iPhone apps open
//   sightwell://add-profile?name=<display name>&url=https://<tenant host>
// and, after one confirmation, add the tenant as a profile and start sign-in.
// IT departments get the same management URL as a macOS configuration
// profile for MDM (Intune, Jamf). The apps refuse anything but https, so
// these helpers return null rather than build a link the apps would refuse.

export const SIGHTWELL_LINK_SCHEME = "sightwell";

// The Sightwell daemon reads managed preferences from its own domain
// (client/hostid MDMDomain), not NetBird's io.netbird.client.
export const SIGHTWELL_MDM_DOMAIN = "ai.sightwell.connectivity";

export type TenantTarget = {
  // https://host[:port], the URL the apps store.
  managementUrl: string;
  // host[:port], for display and file names.
  host: string;
};

// tenantTarget picks the management URL: the gRPC origin the deployment
// configures, else the dashboard's own origin (Sightwell tenants serve both
// from one host). Only https is accepted; 443 is dropped.
export const tenantTarget = (
  grpcApiOrigin: string | undefined,
  pageOrigin: string,
): TenantTarget | null => {
  const candidate = grpcApiOrigin?.trim() || pageOrigin;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !url.hostname) return null;
  const host = url.port ? `${url.hostname}:${url.port}` : url.hostname;
  return { managementUrl: `https://${host}`, host };
};

// tenantDisplayName returns the configured organisation name, else one made
// from the host's first label ("aldercove-energy" -> "Aldercove Energy").
export const tenantDisplayName = (
  configured: string | undefined,
  host: string,
): string => {
  const name = configured?.trim();
  if (name) return name;
  const label = host.split(".")[0] ?? host;
  return label
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const addProfileLink = (name: string, target: TenantTarget): string => {
  const params = new URLSearchParams({ name, url: target.managementUrl });
  // URLSearchParams writes spaces as "+", which a custom-scheme URL parser
  // keeps literally; percent-encode them instead.
  return `${SIGHTWELL_LINK_SCHEME}://add-profile?${params
    .toString()
    .replace(/\+/g, "%20")}`;
};

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export type MobileconfigInput = {
  name: string;
  target: TenantTarget;
  // Fresh UUIDs, so each download is a distinct profile to the OS.
  profileUUID: string;
  payloadUUID: string;
};

// macMobileconfig builds a macOS configuration profile that sets the
// Sightwell app's management URL, following netbird-macos.mobileconfig with
// only the managementURL key enforced.
export const macMobileconfig = ({
  name,
  target,
  profileUUID,
  payloadUUID,
}: MobileconfigInput): string => {
  const id = escapeXml(
    `${SIGHTWELL_MDM_DOMAIN}.mdm.${target.host.replace(/:/g, "-")}`,
  );
  const n = escapeXml(name);
  const url = escapeXml(target.managementUrl);
  const host = escapeXml(target.host);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadIdentifier</key>
    <string>${id}</string>
    <key>PayloadUUID</key>
    <string>${escapeXml(profileUUID)}</string>
    <key>PayloadDisplayName</key>
    <string>Sightwell: ${n}</string>
    <key>PayloadDescription</key>
    <string>Points the Sightwell app on this Mac at ${host}. Users sign in with their ${n} account.</string>
    <key>PayloadOrganization</key>
    <string>${n}</string>
    <key>PayloadScope</key>
    <string>System</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>PayloadType</key>
            <string>com.apple.ManagedClient.preferences</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>PayloadIdentifier</key>
            <string>${id}.preferences</string>
            <key>PayloadUUID</key>
            <string>${escapeXml(payloadUUID)}</string>
            <key>PayloadDisplayName</key>
            <string>Sightwell Managed Preferences</string>
            <key>PayloadEnabled</key>
            <true/>
            <key>PayloadContent</key>
            <dict>
                <key>${SIGHTWELL_MDM_DOMAIN}</key>
                <dict>
                    <key>Forced</key>
                    <array>
                        <dict>
                            <key>mcx_preference_settings</key>
                            <dict>
                                <key>managementURL</key>
                                <string>${url}</string>
                            </dict>
                        </dict>
                    </array>
                </dict>
            </dict>
        </dict>
    </array>
</dict>
</plist>
`;
};

export const mobileconfigFileName = (target: TenantTarget): string =>
  `sightwell-${target.host.replace(/[^a-zA-Z0-9.-]/g, "-")}.mobileconfig`;
