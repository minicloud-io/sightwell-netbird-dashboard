/**
 * Fork-specific: whether the Sightwell tenant is still being configured.
 *
 * The deployment playbook mounts two files next to the dashboard: the
 * netbird-server unit writes `status.json` with `{"state":"configuring"}`
 * when it creates the tenant, and the netbird-config unit adds `ready.json`
 * with `{"state":"ready"}` as its last step. Until then sign-in would fail,
 * so the dashboard shows a "being set up" page instead. Anything else, a
 * missing `status.json` included, means ready: tenants deployed before the
 * files existed must keep working.
 */
export const TENANT_SETUP_DIR = "/.well-known/sightwell-setup";

/** How often the "being set up" page asks again. */
export const TENANT_SETUP_POLL_MS = 10_000;

export type TenantSetupState = "configuring" | "ready";

const stateOf = (body: unknown): unknown =>
  typeof body === "object" && body !== null
    ? (body as { state?: unknown }).state
    : undefined;

/** The state as the two files report it; `null` stands for a missing file. */
export const tenantSetupFrom = (
  status: unknown,
  ready: unknown,
): TenantSetupState =>
  stateOf(status) === "configuring" && stateOf(ready) !== "ready"
    ? "configuring"
    : "ready";

const readJson = async (
  fetchImpl: typeof fetch,
  file: string,
  now: () => number,
): Promise<unknown> => {
  try {
    // the query defeats any cache between the browser and nginx
    const res = await fetchImpl(`${TENANT_SETUP_DIR}/${file}?t=${now()}`, {
      cache: "no-store",
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
};

export const fetchTenantSetup = async (
  fetchImpl: typeof fetch = fetch,
  now: () => number = Date.now,
): Promise<TenantSetupState> => {
  const status = await readJson(fetchImpl, "status.json", now);
  if (stateOf(status) !== "configuring") return "ready";
  return tenantSetupFrom(status, await readJson(fetchImpl, "ready.json", now));
};
