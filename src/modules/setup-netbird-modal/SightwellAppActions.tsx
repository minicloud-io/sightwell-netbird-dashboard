"use client";

import Button from "@components/Button";
import SmallParagraph from "@components/SmallParagraph";
import { GRPC_API_ORIGIN } from "@utils/netbird";
import {
  addProfileLink,
  macMobileconfig,
  mobileconfigFileName,
  tenantDisplayName,
  type TenantTarget,
  tenantTarget,
} from "@utils/sightwellApp";
import { DownloadIcon, ExternalLinkIcon } from "lucide-react";
import React, { useMemo } from "react";
import { tenantName } from "@/branding/runtime";

type Props = {
  // Overrides the tenant derived from the deployment (stories, tests).
  target?: TenantTarget;
  name?: string;
};

const uuid = () => crypto.randomUUID().toUpperCase();

const downloadText = (text: string, fileName: string, type: string) => {
  const url = window.URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Sightwell fork: puts this tenant into the Sightwell desktop and iPhone apps
// without typing the server address, and gives IT a macOS profile for MDM.
export default function SightwellAppActions({
  target: targetOverride,
  name: nameOverride,
}: Readonly<Props>) {
  const target = useMemo(
    () =>
      targetOverride ??
      (typeof window === "undefined"
        ? null
        : tenantTarget(GRPC_API_ORIGIN, window.location.origin)),
    [targetOverride],
  );
  if (!target) return null;

  const name = nameOverride ?? tenantDisplayName(tenantName(), target.host);

  const downloadProfile = () =>
    downloadText(
      macMobileconfig({
        name,
        target,
        profileUUID: uuid(),
        payloadUUID: uuid(),
      }),
      mobileconfigFileName(target),
      "application/x-apple-aspen-config",
    );

  return (
    <div
      className={"flex flex-col items-center gap-3 px-8 pb-5 text-center"}
      data-testid={"sightwell-app-actions"}
    >
      <div className={"flex flex-wrap justify-center gap-3"}>
        <a href={addProfileLink(name, target)}>
          <Button variant={"primary"} tabIndex={-1}>
            <ExternalLinkIcon size={14} />
            Open in Sightwell app
          </Button>
        </a>
        <Button variant={"secondary"} onClick={downloadProfile}>
          <DownloadIcon size={14} />
          Download profile for IT (macOS)
        </Button>
      </div>
      <SmallParagraph className={"max-w-md"}>
        Already have the Sightwell app? Open it here to add {name} (
        {target.host}) and sign in. IT teams can roll the profile out with
        Intune or Jamf.
      </SmallParagraph>
    </div>
  );
}
