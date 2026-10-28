import { useOidcUser } from "@axa-fr/react-oidc";
import Button from "@components/Button";
import {
  ArrowRightIcon,
  BookOpenIcon,
  ExternalLinkIcon,
  LifeBuoyIcon,
  type LucideIcon,
  NetworkIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { BRAND } from "@/branding/brand";
import { docsUrl } from "@/branding/runtime";

type Props = {
  onFinish?: () => void;
};

/*
 * Fork-specific (Sightwell Connectivity): upstream closes the onboarding with
 * three NetBird YouTube guides, illustrated with NetBird dashboard
 * screenshots. They advertise NetBird and do not apply to a Sightwell tenant,
 * so this step points at the same documentation the help menu and the About
 * page offer: the Sightwell Connectivity documentation, and NetBird's
 * technical reference for the client, server and APIs the network runs on.
 */
export const OnboardingEnd = ({ onFinish }: Props) => {
  const { oidcUser: user } = useOidcUser();
  const name = user?.given_name || user?.name || user?.preferred_username;

  const title = name ? `Congratulations, ${name}!` : "Congratulations!";

  return (
    <div className={"relative flex flex-col h-full justify-between"}>
      <div>
        <h1 className={"text-xl text-center max-w-sm mx-auto"}>
          {title} <br />
          You’ve completed the setup.
        </h1>
        <div
          className={
            "text-sm text-nb-gray-300 font-light mt-2 block text-center sm:px-4"
          }
        >
          What’s next? Explore the dashboard to add more sites, collectors and
          users, or read on to get the most out of {BRAND.fullName}.
        </div>

        <div className={"mt-8 flex flex-col gap-3"}>
          <GuideLink
            icon={BookOpenIcon}
            title={`${BRAND.fullName} documentation`}
            description={
              "How sites, collectors and enterprise systems are connected, and how to run the network day to day."
            }
            href={docsUrl()}
          />
          <GuideLink
            icon={NetworkIcon}
            title={"NetBird technical reference"}
            description={
              "The open-source client, server and APIs the network runs on: access control policies, networks, routing peers, DNS and posture checks."
            }
            href={BRAND.links.documentation}
          />
          <GuideLink
            icon={LifeBuoyIcon}
            title={"Client troubleshooting"}
            description={
              "What to check when a machine does not connect or cannot reach a resource."
            }
            href={BRAND.links.troubleshooting}
          />
        </div>

        <div className={"mt-10 flex items-center justify-center"}>
          <Button variant={"secondaryLighter"} onClick={onFinish}>
            Go to Dashboard
            <ArrowRightIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

type GuideLinkProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
};

const GuideLink = ({ icon: Icon, title, description, href }: GuideLinkProps) => {
  return (
    <Link
      className={
        "flex gap-4 items-start text-left border border-nb-gray-900 rounded-lg px-5 py-4 bg-nb-gray-920 hover:bg-nb-gray-900 transition-all group"
      }
      target={"_blank"}
      href={href}
    >
      <div
        className={
          "h-10 w-10 flex items-center justify-center rounded-md shrink-0 bg-nb-gray-900 border border-nb-gray-800 text-netbird"
        }
      >
        <Icon size={18} />
      </div>
      <div>
        <div
          className={
            "text-md inline-flex items-center gap-1.5 group-hover:text-netbird transition-all"
          }
        >
          {title}
          <ExternalLinkIcon size={12} className={"text-nb-gray-400"} />
        </div>
        <div
          className={"text-[0.8rem] text-nb-gray-300 font-light mt-1 block"}
        >
          {description}
        </div>
      </div>
    </Link>
  );
};
