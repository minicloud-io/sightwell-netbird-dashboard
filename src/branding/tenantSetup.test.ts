import { describe, expect, it } from "vitest";
import {
  fetchTenantSetup,
  parseTenantSetup,
  TENANT_SETUP_PATH,
} from "./tenantSetup";

const respond = (status: number, body: unknown) =>
  (async () =>
    new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("parseTenantSetup", () => {
  it("reads configuring", () => {
    expect(parseTenantSetup({ state: "configuring" })).toBe("configuring");
  });
  it("treats ready, other states and other shapes as ready", () => {
    expect(parseTenantSetup({ state: "ready" })).toBe("ready");
    expect(parseTenantSetup({ state: "CONFIGURING" })).toBe("ready");
    expect(parseTenantSetup(null)).toBe("ready");
    expect(parseTenantSetup("configuring")).toBe("ready");
  });
});

describe("fetchTenantSetup", () => {
  it("asks the well-known path without caching", async () => {
    let seen: { url: string; init?: RequestInit } | undefined;
    const spy = (async (url: string, init?: RequestInit) => {
      seen = { url, init };
      return new Response(JSON.stringify({ state: "configuring" }));
    }) as unknown as typeof fetch;
    expect(await fetchTenantSetup(spy, () => 42)).toBe("configuring");
    expect(seen?.url).toBe(`${TENANT_SETUP_PATH}?t=42`);
    expect(seen?.init?.cache).toBe("no-store");
  });
  it("is ready when the file is missing (tenants deployed before it existed)", async () => {
    expect(await fetchTenantSetup(respond(404, {}))).toBe("ready");
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
