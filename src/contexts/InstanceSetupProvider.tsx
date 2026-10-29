"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { fetchInstanceStatus } from "@/utils/unauthenticatedApi";
import { isNetBirdCloud } from "@utils/netbird";
import TenantSettingUp from "@/branding/TenantSettingUp";
import {
  fetchTenantSetup,
  type TenantSetupState,
} from "@/branding/tenantSetup";

interface InstanceSetupContextType {
  setupRequired: boolean;
  loading: boolean;
}

const InstanceSetupContext = createContext<InstanceSetupContextType>({
  setupRequired: false,
  loading: true,
});

export const useInstanceSetup = () => useContext(InstanceSetupContext);

// Check if we're in an OIDC callback flow (hash-based routing)
const isOIDCCallback = () => {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  return hash.startsWith("#callback") || hash.startsWith("#silent-callback");
};

export default function InstanceSetupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  // Fork-specific: null while the Sightwell tenant file is being read.
  const [tenant, setTenant] = useState<TenantSetupState | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Routes that don't need setup check
  const bypassRoutes = ["/install"];
  const shouldBypass = bypassRoutes.includes(pathname) || isOIDCCallback();

  // Skip setup check for NetBird hosted (cloud) deployments
  const isCloud = isNetBirdCloud();
  const isSetupPage = pathname === "/setup";

  // Fork-specific: the deployment marks the tenant "configuring" until its
  // last unit finishes; sign-in fails until then (see branding/tenantSetup).
  useEffect(() => {
    if (!shouldBypass) void fetchTenantSetup().then(setTenant);
  }, [shouldBypass]);
  const tenantState = shouldBypass ? "ready" : tenant;

  // Check instance status on mount
  useEffect(() => {
    // Skip check for cloud deployments or bypass routes
    if (isCloud || shouldBypass) {
      setLoading(false);
      return;
    }

    // Check if instance setup is required
    fetchInstanceStatus()
      .then((status) => {
        if (status.setup_required) {
          setSetupRequired(true);
        }
      })
      .catch((err) => {
        // If API fails (e.g., endpoint doesn't exist on older versions),
        // assume setup is not required and continue normally
        console.warn("Instance status check failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shouldBypass, isCloud]);

  // Handle redirect separately to avoid setState during render conflicts
  useEffect(() => {
    // Fork-specific: never offer owner setup while the deployment configures
    // the tenant; the deployment creates the owner itself.
    if (
      setupRequired &&
      !shouldBypass &&
      !isSetupPage &&
      tenantState === "ready"
    ) {
      router.replace("/setup");
    }
  }, [setupRequired, shouldBypass, router, isSetupPage, tenantState]);

  if (tenantState === "configuring") return <TenantSettingUp />;

  // Show loading while checking (only for non-cloud, non-bypass routes)
  if ((loading || tenantState === null) && !shouldBypass && !isCloud) {
    return <FullScreenLoading />;
  }

  // If setup required and not on setup page, wait for redirect
  if (setupRequired && !shouldBypass && !isSetupPage) {
    return <FullScreenLoading />;
  }

  return (
    <InstanceSetupContext.Provider value={{ setupRequired, loading }}>
      {children}
    </InstanceSetupContext.Provider>
  );
}
