import loadConfig from "@utils/config";
import { safeHttpUrl } from "@/branding/brand";

/**
 * Sightwell fork: presentation settings that are decided per deployment
 * rather than per build. They arrive through config.json, substituted by
 * docker/init_react_envs.sh from SIGHTWELL_* environment variables, like the
 * NETBIRD_* settings next to them.
 */
const config = loadConfig();

export const DEFAULT_DOCS_URL = "https://sightwell.ai/connectivity";

/** Where the Documentation entries point. Anything that is not http(s) falls back. */
export const docsUrl = () =>
  safeHttpUrl(config.sightwellDocsUrl, DEFAULT_DOCS_URL);

/** Hide the Integrations menu (default). Set SIGHTWELL_HIDE_INTEGRATIONS=false to show it. */
export const hideIntegrations = () => config.sightwellHideIntegrations;

/** Organisation name for the Sightwell app link and IT profile; undefined derives one from the host. */
export const tenantName = () => config.sightwellTenantName;
