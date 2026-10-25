import { cn } from "@utils/helpers";
import * as React from "react";

type Props = {
  /** Outer diameter in px. */
  size?: number;
  className?: string;
  /** Accessible label; pass an empty string when a parent already labels it. */
  label?: string;
};

/**
 * Page-level loading indicator (fork-specific): the Sightwell sight-glass mark
 * with a signal-orange arc turning around it, replacing upstream's bouncing
 * bars. Everything is drawn in one SVG so it needs no image request, the arc
 * stops turning under prefers-reduced-motion, and the colours are the brand's
 * dark-surface set because every upstream loading surface is dark.
 */
export const BrandSpinner = ({
  size = 44,
  className,
  label = "Loading",
}: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    role={label ? "img" : undefined}
    aria-label={label || undefined}
    aria-hidden={label ? undefined : true}
    className={cn("shrink-0", className)}
    data-testid={"brand-spinner"}
  >
    <defs>
      <clipPath id="sw-spinner-glass">
        <circle cx="60" cy="60" r="26" />
      </clipPath>
    </defs>
    {/* track */}
    <circle
      cx="60"
      cy="60"
      r="53"
      fill="none"
      stroke="#2A2F34"
      strokeWidth="6"
    />
    {/* turning arc: 270° of the circumference (2π·53 ≈ 333) */}
    <g className={"origin-center motion-safe:animate-spin"}>
      <circle
        cx="60"
        cy="60"
        r="53"
        fill="none"
        stroke="#F07A3A"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="250 333"
        transform="rotate(-90 60 60)"
      />
    </g>
    {/* simplified mark, reversed for dark surfaces */}
    <circle cx="60" cy="60" r="40" fill="#ECEAE4" />
    <circle cx="60" cy="60" r="26" fill="#1A1E22" />
    <rect
      x="30"
      y="66"
      width="60"
      height="30"
      fill="#F07A3A"
      clipPath="url(#sw-spinner-glass)"
    />
  </svg>
);

export default BrandSpinner;
