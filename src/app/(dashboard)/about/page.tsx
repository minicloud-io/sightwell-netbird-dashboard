"use client";

/*
 * Fork-specific (Sightwell Connectivity): the About and open-source notices
 * page. It names the product, says plainly that it is a Sightwell-branded
 * adaptation of the NetBird dashboard, shows the build the user is running
 * and carries the AGPL source-code offer for the exact revision. It needs no
 * permission: every signed-in user can reach it from the sidebar and the
 * help menu.
 */
import Breadcrumbs from "@components/Breadcrumbs";
import Button from "@components/Button";
import Card from "@components/Card";
import InlineLink from "@components/InlineLink";
import Paragraph from "@components/Paragraph";
import {
  BookText,
  CodeIcon,
  ExternalLinkIcon,
  FileTextIcon,
  InfoIcon,
  ScaleIcon,
  TriangleAlert,
} from "lucide-react";
import * as React from "react";
import {
  BRAND,
  brandLicenseUrl,
  brandModificationsUrl,
  brandSourceTreeUrl,
  shortRevision,
  UPSTREAM,
} from "@/branding/brand";
import { BrandLogo } from "@/branding/BrandLogo";
import { docsUrl } from "@/branding/runtime";
import PageContainer from "@/layouts/PageContainer";

const dashboardVersion =
  process.env.NEXT_PUBLIC_DASHBOARD_VERSION || "development";

export default function AboutPage() {
  const sourceUrl = brandSourceTreeUrl();
  const pinned = BRAND.revision !== "development";

  return (
    <PageContainer>
      <div className={"p-default py-6"}>
        <Breadcrumbs>
          <Breadcrumbs.Item
            href={"/about"}
            label={"About"}
            icon={<InfoIcon size={13} />}
            active
          />
        </Breadcrumbs>

        <div className={"flex items-center gap-4 mb-3"}>
          <BrandLogo size={"large"} module />
        </div>
        <h1>About {BRAND.fullName}</h1>
        <Paragraph className={"max-w-3xl"}>{BRAND.description}</Paragraph>

        <div
          className={
            "grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8 max-w-6xl items-start"
          }
        >
          <Card className={"w-full"} data-testid={"about-build"}>
            <SectionTitle>This build</SectionTitle>
            <Card.List>
              <Card.ListItem
                label={"Dashboard version"}
                value={dashboardVersion}
                tooltip={false}
              />
              <Card.ListItem
                label={"Fork revision"}
                value={
                  <span className={"font-mono"}>
                    {shortRevision(BRAND.revision)}
                  </span>
                }
                valueToCopy={BRAND.revision}
                copy={pinned}
                copyText={"Fork revision"}
                tooltip={false}
              />
              <Card.ListItem
                label={"Upstream baseline"}
                value={
                  <span className={"font-mono"}>
                    {UPSTREAM.baselineTag} ·{" "}
                    {shortRevision(UPSTREAM.baselineCommit)}
                  </span>
                }
                valueToCopy={UPSTREAM.baselineCommit}
                copy
                copyText={"Upstream baseline commit"}
                tooltip={false}
              />
              <Card.ListItem
                label={"Source repository"}
                value={
                  <InlineLink href={BRAND.sourceUrl} target={"_blank"}>
                    {BRAND.sourceUrl.replace(/^https?:\/\//, "")}
                    <ExternalLinkIcon size={12} />
                  </InlineLink>
                }
                tooltip={false}
              />
            </Card.List>
            {!pinned && (
              <p
                className={
                  "px-4 py-3 border-t border-nb-gray-900 text-xs text-nb-gray-400"
                }
              >
                This is a development build. Release builds record the exact
                commit here and link to it below.
              </p>
            )}
          </Card>

          <Card className={"w-full"} data-testid={"about-open-source"}>
            <SectionTitle>Open source</SectionTitle>
            <div className={"px-4 py-4 flex flex-col gap-3"}>
              <Paragraph className={"block text-sm"}>
                This dashboard is a modified version of the{" "}
                <InlineLink href={UPSTREAM.repository} target={"_blank"}>
                  {UPSTREAM.name}
                  <ExternalLinkIcon size={12} />
                </InlineLink>
                , free software published by {UPSTREAM.vendor} under the{" "}
                {UPSTREAM.licenseName}. {BRAND.productName} and {BRAND.vendor}{" "}
                are not affiliated with, nor endorsed by, {UPSTREAM.vendor}.
                NetBird remains the name of the client, server, APIs and
                documentation this deployment runs on.
              </Paragraph>
              <Paragraph className={"block text-sm"}>
                Because you interact with this modified program over a network,
                you are entitled to its complete corresponding source code,
                including {BRAND.productName}&apos;s modifications and the build
                and installation scripts, for the exact revision you are using.
                It is published at the link below at no charge.
              </Paragraph>
              <div className={"flex flex-wrap gap-2 mt-1"}>
                <a
                  href={sourceUrl}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                >
                  <Button variant={"primary"} size={"xs"}>
                    <CodeIcon size={14} />
                    Source code
                    {pinned && (
                      <span className={"font-mono font-normal opacity-80"}>
                        {shortRevision(BRAND.revision)}
                      </span>
                    )}
                  </Button>
                </a>
                <a
                  href={brandLicenseUrl()}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                >
                  <Button variant={"secondary"} size={"xs"}>
                    <ScaleIcon size={14} />
                    Licence ({UPSTREAM.license})
                  </Button>
                </a>
                <a href={BRAND.thirdPartyNoticesPath} target={"_blank"}>
                  <Button variant={"secondary"} size={"xs"}>
                    <FileTextIcon size={14} />
                    Third-party notices
                  </Button>
                </a>
                <a
                  href={brandModificationsUrl()}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                >
                  <Button variant={"secondary"} size={"xs"}>
                    <FileTextIcon size={14} />
                    Modifications
                  </Button>
                </a>
              </div>
            </div>
          </Card>

          <Card className={"w-full"} data-testid={"about-help"}>
            <SectionTitle>Help</SectionTitle>
            <div className={"px-4 py-4 flex flex-col gap-3"}>
              <Paragraph className={"block text-sm"}>
                {BRAND.fullName} is documented at the link below. The networking
                technology underneath, its client installers and its management
                API are documented by NetBird. For questions about this
                deployment, its identity provider or who may access it, contact
                your administrator.
              </Paragraph>
              <div className={"flex flex-wrap gap-2 mt-1"}>
                <a
                  href={docsUrl()}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                >
                  <Button variant={"primary"} size={"xs"}>
                    <BookText size={14} />
                    Documentation
                  </Button>
                </a>
                <a
                  href={BRAND.links.documentation}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                >
                  <Button variant={"secondary"} size={"xs"}>
                    <BookText size={14} />
                    NetBird technical reference
                  </Button>
                </a>
                <a
                  href={BRAND.links.troubleshooting}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                >
                  <Button variant={"secondary"} size={"xs"}>
                    <TriangleAlert size={14} />
                    Client troubleshooting
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div
    className={
      "px-4 py-3 border-b border-nb-gray-900 text-[0.84rem] font-medium text-nb-gray-100"
    }
  >
    {children}
  </div>
);
