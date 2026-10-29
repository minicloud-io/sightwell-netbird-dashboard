import {
  addProfileLink,
  macMobileconfig,
  mobileconfigFileName,
  SIGHTWELL_MDM_DOMAIN,
  tenantDisplayName,
  tenantTarget,
} from "@utils/sightwellApp";
import { describe, expect, it } from "vitest";

const demo = {
  managementUrl: "https://aldercove-energy.sightwell.ai",
  host: "aldercove-energy.sightwell.ai",
};

describe("tenantTarget", () => {
  it("uses the configured gRPC origin and drops the default port", () => {
    expect(
      tenantTarget(
        "https://aldercove-energy.sightwell.ai:443",
        "https://elsewhere.example.com",
      ),
    ).toEqual(demo);
  });

  it("falls back to the dashboard origin", () => {
    expect(tenantTarget("", "https://aldercove-energy.sightwell.ai")).toEqual(
      demo,
    );
    expect(
      tenantTarget(undefined, "https://aldercove-energy.sightwell.ai"),
    ).toEqual(demo);
  });

  it("keeps a non-default port", () => {
    expect(tenantTarget("https://t.example.com:8443", "")).toEqual({
      managementUrl: "https://t.example.com:8443",
      host: "t.example.com:8443",
    });
  });

  it("refuses anything but https, as the apps do", () => {
    expect(tenantTarget("http://t.example.com", "")).toBeNull();
    expect(tenantTarget("", "http://localhost:3000")).toBeNull();
    expect(tenantTarget("not a url", "")).toBeNull();
  });
});

describe("tenantDisplayName", () => {
  it("prefers the configured name", () => {
    expect(tenantDisplayName(" Alder Cove Energy ", demo.host)).toBe(
      "Alder Cove Energy",
    );
  });

  it("derives a name from the host's first label", () => {
    expect(tenantDisplayName(undefined, demo.host)).toBe("Aldercove Energy");
    expect(tenantDisplayName("", "sawgrass_lng.example.com:8443")).toBe(
      "Sawgrass Lng",
    );
  });
});

describe("addProfileLink", () => {
  it("builds the add-profile link with encoded parameters", () => {
    expect(addProfileLink("Alder Cove & Co", demo)).toBe(
      "sightwell://add-profile?name=Alder%20Cove%20%26%20Co&url=https%3A%2F%2Faldercove-energy.sightwell.ai",
    );
  });

  it("round-trips through a URL parser", () => {
    const url = new URL(addProfileLink("Alder Cove Energy", demo));
    expect(url.protocol).toBe("sightwell:");
    expect(url.host).toBe("add-profile");
    expect(url.searchParams.get("name")).toBe("Alder Cove Energy");
    expect(url.searchParams.get("url")).toBe(demo.managementUrl);
  });
});

describe("macMobileconfig", () => {
  const profile = macMobileconfig({
    name: "Alder <Cove> & Energy",
    target: demo,
    profileUUID: "A1B2C3D4-0000-4000-8000-000000000001",
    payloadUUID: "A1B2C3D4-0000-4000-8000-000000000002",
  });

  it("is well-formed XML", () => {
    const doc = new DOMParser().parseFromString(profile, "application/xml");
    expect(doc.getElementsByTagName("parsererror")).toHaveLength(0);
  });

  it("sets managementURL, and nothing else, under the Sightwell domain", () => {
    expect(profile).toContain(`<key>${SIGHTWELL_MDM_DOMAIN}</key>`);
    expect(profile).not.toContain("io.netbird.client");
    const settings = profile.match(
      /<key>mcx_preference_settings<\/key>\s*<dict>([\s\S]*?)<\/dict>/,
    )?.[1];
    expect(settings?.match(/<key>[^<]*<\/key>/g)).toEqual([
      "<key>managementURL</key>",
    ]);
    expect(settings).toContain(
      "<string>https://aldercove-energy.sightwell.ai</string>",
    );
  });

  it("carries the given UUIDs and a per-tenant identifier", () => {
    expect(profile).toContain("A1B2C3D4-0000-4000-8000-000000000001");
    expect(profile).toContain("A1B2C3D4-0000-4000-8000-000000000002");
    expect(profile).toContain(
      "<string>ai.sightwell.connectivity.mdm.aldercove-energy.sightwell.ai</string>",
    );
  });

  it("escapes the organisation name", () => {
    expect(profile).toContain("Sightwell: Alder &lt;Cove&gt; &amp; Energy");
  });
});

describe("mobileconfigFileName", () => {
  it("names the file after the host", () => {
    expect(mobileconfigFileName(demo)).toBe(
      "sightwell-aldercove-energy.sightwell.ai.mobileconfig",
    );
    expect(
      mobileconfigFileName({ managementUrl: "", host: "t.example.com:8443" }),
    ).toBe("sightwell-t.example.com-8443.mobileconfig");
  });
});
