import { cn } from "@utils/helpers";
import * as React from "react";
import {
  BRAND,
  brandLicenseUrl,
  brandSourceTreeUrl,
  shortRevision,
  UPSTREAM,
} from "@/branding/brand";

type Props = {
  className?: string;
};

const linkClass =
  "underline underline-offset-4 decoration-nb-gray-600 hover:text-nb-gray-100 transition-colors";

/**
 * The source-code offer for surfaces a user sees before or outside the signed
 * in dashboard (setup wizard, invite, session lost, errors). The AGPL asks for
 * a prominent offer of the complete corresponding source to everyone who
 * interacts with the modified dashboard, so this footer links the exact
 * revision the build was made from. Inside the dashboard the About page
 * carries the same offer. The screens it sits on are dark in both themes at
 * this upstream baseline, so it uses the dark-surface neutrals only.
 */
export const BrandFooter = ({ className }: Props) => (
  <footer
    className={cn(
      "text-xs text-nb-gray-400 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center leading-relaxed",
      className,
    )}
    data-testid={"brand-footer"}
  >
    <span>{BRAND.fullName}</span>
    <span aria-hidden>·</span>
    <span>
      Built on the {UPSTREAM.name} ({UPSTREAM.license})
    </span>
    <span aria-hidden>·</span>
    <a
      href={brandSourceTreeUrl()}
      target={"_blank"}
      rel={"noopener noreferrer"}
      className={linkClass}
    >
      Source code
      {BRAND.revision !== "development" && (
        <span className={"font-mono"}> {shortRevision(BRAND.revision)}</span>
      )}
    </a>
    <span aria-hidden>·</span>
    <a
      href={brandLicenseUrl()}
      target={"_blank"}
      rel={"noopener noreferrer"}
      className={linkClass}
    >
      Licence
    </a>
  </footer>
);

export default BrandFooter;
