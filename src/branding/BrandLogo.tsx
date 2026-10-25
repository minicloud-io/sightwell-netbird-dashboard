import { cn } from "@utils/helpers";
import Image from "next/image";
import * as React from "react";
import IconSmallLight from "@/assets/sightwell/sightwell-icon-small.svg";
import IconSmallDark from "@/assets/sightwell/sightwell-icon-small-reversed.svg";
import LogoLight from "@/assets/sightwell/sightwell-logo.svg";
import LogoDark from "@/assets/sightwell/sightwell-logo-reversed.svg";
import { BRAND } from "@/branding/brand";

/**
 * Which surface the logo sits on. "theme" follows the `dark` class on <html>
 * (the header and sidebar, which upstream styles for both themes). "dark" is
 * the default because every other upstream surface at this baseline (page
 * content, cards, the pre-login screens) is dark in both themes.
 */
export type BrandSurface = "theme" | "dark" | "light";

type Props = {
  size?: "default" | "large";
  /** Collapse to the mark alone below the md breakpoint (header use). */
  mobile?: boolean;
  /** Show the module name ("Connectivity") next to the lockup. */
  module?: boolean;
  surface?: BrandSurface;
  className?: string;
};

/* Heights of the lockup; its width follows the SVG aspect ratio (618:132). */
const sizes = {
  default: { desktop: 24, mobile: 28 },
  large: { desktop: 32, mobile: 40 },
};

/** Visibility classes for the light-surface and dark-surface variants. */
export const surfaceClasses = (surface: BrandSurface) =>
  surface === "theme"
    ? { light: "dark:hidden", dark: "hidden dark:block" }
    : surface === "dark"
    ? { light: "hidden", dark: "block" }
    : { light: "block", dark: "hidden" };

/*
 * The header collapses to the mark below the md breakpoint. Every class is
 * written out literally: Tailwind only generates classes it finds in the
 * source, so `dark:md:block` built from pieces at runtime would not exist.
 */
const lockupClasses: Record<BrandSurface, { light: string; dark: string }> = {
  theme: {
    light: "hidden md:block dark:md:hidden",
    dark: "hidden dark:md:block",
  },
  dark: { light: "hidden", dark: "hidden md:block" },
  light: { light: "hidden md:block", dark: "hidden" },
};
const markClasses: Record<BrandSurface, { light: string; dark: string }> = {
  theme: {
    light: "block md:hidden dark:hidden",
    dark: "hidden dark:block dark:md:hidden",
  },
  dark: { light: "hidden", dark: "block md:hidden" },
  light: { light: "block md:hidden", dark: "hidden" },
};

/**
 * The Sightwell lockup (fork-specific). For the themed surface both variants
 * are in the DOM and toggled by the `dark` class on <html>, so a theme switch
 * never flashes a missing logo.
 */
export const BrandLogo = ({
  size = "default",
  mobile = false,
  module = false,
  surface = "dark",
  className,
}: Props) => {
  const height = sizes[size].desktop;
  const markSize = sizes[size].mobile;
  const lockup = mobile ? lockupClasses[surface] : surfaceClasses(surface);
  const mark = markClasses[surface];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={LogoLight}
        height={height}
        alt={BRAND.productName}
        className={lockup.light}
        priority
      />
      <Image
        src={LogoDark}
        height={height}
        alt={BRAND.productName}
        className={lockup.dark}
        priority
      />
      {mobile && (
        <>
          <Image
            src={IconSmallLight}
            width={markSize}
            height={markSize}
            alt={BRAND.productName}
            className={mark.light}
          />
          <Image
            src={IconSmallDark}
            width={markSize}
            height={markSize}
            alt={BRAND.productName}
            className={mark.dark}
          />
        </>
      )}
      {module && (
        <ModuleBadge
          surface={surface}
          className={mobile ? "hidden sm:inline-flex" : ""}
        />
      )}
    </span>
  );
};

/**
 * "Connectivity" as a quiet mono label beside the wordmark, the same chip
 * pattern the Sightwell console pages use for their context badge.
 */
export const ModuleBadge = ({
  surface = "dark",
  className,
}: {
  surface?: BrandSurface;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center h-[22px] px-1.5 rounded border font-mono text-[10px] font-medium uppercase tracking-[0.08em] leading-none select-none",
      surface === "theme" &&
        "border-gray-300 text-gray-600 dark:border-nb-gray-800 dark:text-nb-gray-300",
      surface === "dark" && "border-nb-gray-800 text-nb-gray-300",
      surface === "light" && "border-gray-300 text-gray-600",
      className,
    )}
  >
    {BRAND.moduleName}
  </span>
);
