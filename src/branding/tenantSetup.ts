/**
 * Fork-specific: whether the Sightwell tenant is still being configured.
 *
 * The deployment playbook mounts this file next to the dashboard: the
 * netbird-server unit writes `{"state":"configuring"}` when it creates the
 * tenant and the netbird-config unit sets `{"state":"ready"}` as its last
 * step. Until then sign-in would fail, so the dashboard shows a "being set
 * up" page instead. A missing or unreadable file means ready: tenants
 * deployed before the file existed must keep working.
 */
export const TENANT_SETUP_PATH = "/.well-known/sightwell-setup/status.json";

/** How often the "being set up" page asks again. */
export const TENANT_SETUP_POLL_MS = 10_000;

export type TenantSetupState = "configuring" | "ready";

export const parseTenantSetup = (body: unknown): TenantSetupState =>
  typeof body === "object" &&
  body !== null &&
  (body as { state?: unknown }).state === "configuring"
    ? "configuring"
    : "ready";

export const fetchTenantSetup = async (
  fetchImpl: typeof fetch = fetch,
  now: () => number = Date.now,
): Promise<TenantSetupState> => {
  try {
    // the query defeats any cache between the browser and nginx
    const res = await fetchImpl(`${TENANT_SETUP_PATH}?t=${now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return "ready";
    return parseTenantSetup(await res.json());
  } catch {
    return "ready";
  }
};
