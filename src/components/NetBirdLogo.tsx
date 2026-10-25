import * as React from "react";
import { BrandLogo } from "@/branding/BrandLogo";

/*
 * Fork-specific (Sightwell Connectivity): upstream's product lockup is the
 * NetBird logo. Every place that shows the *product's* identity (header,
 * setup wizard, onboarding, pending approval) imports this component, so it
 * now renders the Sightwell lockup with the same props. Keeping the file and
 * its API means the upstream call sites need no change on an upgrade.
 *
 * Where the NetBird bird marks the NetBird client or server itself, the
 * NetBirdIcon in src/assets/icons stays untouched.
 */

type Props = {
  size?: "default" | "large";
  mobile?: boolean;
};

export const NetBirdLogo = ({ size = "default", mobile = true }: Props) => (
  <BrandLogo size={size} mobile={mobile} />
);
