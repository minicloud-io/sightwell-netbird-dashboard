import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BrandFooter from "@/branding/BrandFooter";
import BrandIcon from "@/branding/BrandIcon";
import { BrandLogo, ModuleBadge } from "@/branding/BrandLogo";
import { padded, Row, Stack } from "@/storybook/components";

/* Fork-specific: the Sightwell identity pieces in both themes. */
const meta: Meta = {
  title: "Components/Branding",
  decorators: [padded],
};
export default meta;

export const Logo: StoryObj = {
  render: () => (
    <Stack>
      <Row label={"lockup"}>
        <BrandLogo />
        <BrandLogo size={"large"} />
      </Row>
      <Row label={"header"}>
        <BrandLogo mobile module surface={"theme"} />
      </Row>
      <Row label={"light surface"}>
        <span className={"bg-gray-50 p-3 rounded-md inline-flex gap-4"}>
          <BrandLogo surface={"light"} module />
          <BrandIcon size={24} surface={"light"} />
        </span>
      </Row>
      <Row label={"module"}>
        <ModuleBadge />
      </Row>
      <Row label={"mark"}>
        <BrandIcon size={16} />
        <BrandIcon size={24} />
        <BrandIcon size={32} />
        <BrandIcon size={48} />
      </Row>
    </Stack>
  ),
};

export const SourceOffer: StoryObj = {
  render: () => <BrandFooter />,
};
