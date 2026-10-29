import { describe, expect, it } from "vitest";
import {
  fetchTenantSetup,
  TENANT_SETUP_DIR,
  tenantSetupFrom,
} from "./tenantSetup";

const CONFIGURING = { state: "configuring" };
const READY = { state: "ready" };

/** A fetch that serves the given files by name; anything else is a 404. */
const serve = (files: Record<string, unknown>) => {
  const asked: { url: string; init?: RequestInit }[] = [];
  const impl = (async (url: string, init?: RequestInit) => {
    asked.push({ url, init });
    const name = url.slice(TENANT_SETUP_DIR.length + 1).split("?")[0];
    return name in files
      ? new Response(JSON.stringify(files[name]))
      : new Response("not found", { status: 404 });
  }) as unknown as typeof fetch;
  return { impl, asked };
};

describe("tenantSetupFrom", () => {
  it("is configuring until ready.json says ready", () => {
    expect(tenantSetupFrom(CONFIGURING, null)).toBe("configuring");
    expect(tenantSetupFrom(CONFIGURING, { state: "nope" })).toBe("configuring");
    expect(tenantSetupFrom(CONFIGURING, READY)).toBe("ready");
  });
  it("is ready whenever status.json does not say configuring", () => {
    expect(tenantSetupFrom(null, null)).toBe("ready");
    expect(tenantSetupFrom({ state: "CONFIGURING" }, null)).toBe("ready");
    expect(tenantSetupFrom("configuring", null)).toBe("ready");
  });
});

describe("fetchTenantSetup", () => {
  it("reads status.json without caching, then ready.json", async () => {
    const { impl, asked } = serve({ "status.json": CONFIGURING });
    expect(await fetchTenantSetup(impl, () => 42)).toBe("configuring");
    expect(asked.map((a) => a.url)).toEqual([
      `${TENANT_SETUP_DIR}/status.json?t=42`,
      `${TENANT_SETUP_DIR}/ready.json?t=42`,
    ]);
    expect(asked.every((a) => a.init?.cache === "no-store")).toBe(true);
  });
  it("is ready once netbird-config has written ready.json", async () => {
    const { impl } = serve({ "status.json": CONFIGURING, "ready.json": READY });
    expect(await fetchTenantSetup(impl)).toBe("ready");
  });
  it("is ready without asking further when status.json is missing (tenants deployed before it existed)", async () => {
    const { impl, asked } = serve({});
    expect(await fetchTenantSetup(impl)).toBe("ready");
    expect(asked).toHaveLength(1);
  });
  it("is ready when the request or the JSON fails", async () => {
    const broken = (async () => {
      throw new TypeError("network");
    }) as unknown as typeof fetch;
    expect(await fetchTenantSetup(broken)).toBe("ready");
    const html = (async () =>
      new Response("<html>")) as unknown as typeof fetch;
    expect(await fetchTenantSetup(html)).toBe("ready");
  });
});
