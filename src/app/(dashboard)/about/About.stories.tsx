import type { Meta } from "@storybook/nextjs-vite";
import AboutPage from "@/app/(dashboard)/about/page";
import {
  inLayout,
  nav,
  resetStorage,
  type Story,
  text,
} from "@/storybook/core";

/* Fork-specific: the About and open-source notices page. */
const meta: Meta = {
  title: "Pages/Platform/About",
  parameters: nav("/about"),
  beforeEach: resetStorage,
  render: inLayout(AboutPage),
};
export default meta;

export const Default: Story = {
  play: async () => void (await text("Open source")),
};
