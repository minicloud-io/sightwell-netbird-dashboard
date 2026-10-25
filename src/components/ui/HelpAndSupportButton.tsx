"use client";

import Button from "@components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@components/DropdownMenu";
import { cn } from "@utils/helpers";
import { useGuardedRouter } from "@utils/navigation-guard";
import { isNetBirdCloud } from "@utils/netbird";
import {
  ArrowUpRightIcon,
  BookText,
  CircleQuestionMark,
  CodeIcon,
  InfoIcon,
  MailIcon,
  MessagesSquareIcon,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { BRAND, brandSourceTreeUrl } from "@/branding/brand";
import { docsUrl } from "@/branding/runtime";

/*
 * Fork-specific (Sightwell Connectivity). Upstream's menu points at NetBird's
 * documentation, forum, Slack and a product-feedback form. The documentation,
 * troubleshooting guide and community forum genuinely cover the NetBird
 * client and server this deployment runs, so they stay and are labelled as
 * NetBird's. The Slack invite and the feedback form are NetBird's product
 * channels and are dropped; the About page and the source-code offer take
 * their place. No Sightwell support URL is invented here.
 */
export default function HelpAndSupportButton() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useGuardedRouter();

  return (
    <DropdownMenu
      modal={false}
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
    >
      <DropdownMenuTrigger asChild={true}>
        <Button
          size={"xs"}
          variant={"default-outline"}
          className={cn(
            "!rounded-full h-[38px] w-[38px] !p-0",
            dropdownOpen && "text-white",
          )}
          aria-label={"Help and support"}
        >
          <CircleQuestionMark size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 px-1">
            <div className="text-sm font-normal leading-none text-nb-gray-200 py-1">
              Help and Support
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          href={docsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          asChild
        >
          <div className={"flex gap-3 items-center"}>
            <BookText size={14} />
            Documentation
          </div>
          <DropdownMenuShortcut>
            <ArrowUpRightIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          href={BRAND.links.documentation}
          target="_blank"
          rel="noopener noreferrer"
          asChild
        >
          <div className={"flex gap-3 items-center"}>
            <BookText size={14} />
            NetBird technical reference
          </div>
          <DropdownMenuShortcut>
            <ArrowUpRightIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          href={BRAND.links.troubleshooting}
          target="_blank"
          rel="noopener noreferrer"
          asChild
        >
          <div className={"flex gap-3 items-center"}>
            <TriangleAlert size={14} />
            Client troubleshooting
          </div>
          <DropdownMenuShortcut>
            <ArrowUpRightIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        {isNetBirdCloud() && (
          <DropdownMenuItem href="mailto:support@netbird.io?subject=Support Request">
            <div className={"flex gap-3 items-center"}>
              <MailIcon size={14} />
              support@netbird.io
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          href={BRAND.links.communityForum}
          target="_blank"
          rel="noopener noreferrer"
          asChild
        >
          <div className={"flex gap-3 items-center"}>
            <MessagesSquareIcon size={14} />
            NetBird community forum
          </div>
          <DropdownMenuShortcut>
            <ArrowUpRightIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setDropdownOpen(false);
            router.push("/about");
          }}
        >
          <div className={"flex gap-3 items-center"}>
            <InfoIcon size={14} />
            About and open source notices
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          href={brandSourceTreeUrl()}
          target="_blank"
          rel="noopener noreferrer"
          asChild
        >
          <div className={"flex gap-3 items-center"}>
            <CodeIcon size={14} />
            Source code
          </div>
          <DropdownMenuShortcut>
            <ArrowUpRightIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
