"use client";

import Paragraph from "@components/Paragraph";
import * as React from "react";
import { useEffect } from "react";
import BrandFooter from "@/branding/BrandFooter";
import BrandSpinner from "@/branding/BrandSpinner";
import { fetchTenantSetup, TENANT_SETUP_POLL_MS } from "@/branding/tenantSetup";

type Props = {
  /** Off in stories, so the page does not reload itself. */
  poll?: boolean;
};

/**
 * Fork-specific: shown instead of sign-in while the deployment is still
 * configuring the tenant. It asks again every few seconds and reloads into
 * the normal sign-in flow once the tenant is ready. Same layout as the
 * sign-in error page, with the turning mark in place of its icon tile, so the
 * page carries one mark rather than two.
 */
export const TenantSettingUp = ({ poll = true }: Props) => {
  useEffect(() => {
    if (!poll) return;
    const id = setInterval(() => {
      void fetchTenantSetup().then((state) => {
        if (state === "ready") window.location.reload();
      });
    }, TENANT_SETUP_POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  return (
    <div
      className={
        "flex items-center justify-center flex-col h-screen max-w-lg mx-auto px-6"
      }
    >
      <BrandSpinner size={48} className={"mb-3"} label={"Setting up"} />
      <h1 className={"text-center mt-2"}>Your tenant is being set up</h1>
      <Paragraph className={"text-center mt-2 block"}>
        This usually takes a few minutes. This page checks again every{" "}
        {TENANT_SETUP_POLL_MS / 1000} seconds and opens sign-in as soon as the
        tenant is ready.
      </Paragraph>
      <BrandFooter className={"mt-10"} />
    </div>
  );
};

export default TenantSettingUp;
