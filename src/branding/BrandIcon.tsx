import { cn } from "@utils/helpers";
import Image from "next/image";
import * as React from "react";
import IconSmallLight from "@/assets/sightwell/sightwell-icon-small.svg";
import IconSmallDark from "@/assets/sightwell/sightwell-icon-small-reversed.svg";
import MarkLight from "@/assets/sightwell/sightwell-mark.svg";
import MarkDark from "@/assets/sightwell/sightwell-mark-reversed.svg";
import { BRAND } from "@/branding/brand";
import { type BrandSurface, surfaceClasses } from "@/branding/BrandLogo";

type Props = {
  size?: number;
  surface?: BrandSurface;
  className?: string;
};

/**
 * The Sightwell mark on its own (fork-specific), for the product-identity
 * spots that upstream fills with the NetBird bird: signed-out, error and
 * invite screens. Where the bird marks the NetBird client or server itself
 * (peer versions, posture checks, SSH instructions) NetBirdIcon stays.
 *
 * Below 33 px the simplified mark without the bolt ring is used, as the
 * brand guide asks. The surface defaults to "dark" like BrandLogo.
 */
export const BrandIcon = ({
  size = 16,
  surface = "dark",
  className,
}: Props) => {
  const small = size <= 32;
  const light = small ? IconSmallLight : MarkLight;
  const dark = small ? IconSmallDark : MarkDark;
  const show = surfaceClasses(surface);
  return (
    <>
      <Image
        src={light}
        width={size}
        height={size}
        alt={BRAND.productName}
        className={cn(show.light, className)}
      />
      <Image
        src={dark}
        width={size}
        height={size}
        alt={BRAND.productName}
        className={cn(show.dark, className)}
      />
    </>
  );
};

export default BrandIcon;
