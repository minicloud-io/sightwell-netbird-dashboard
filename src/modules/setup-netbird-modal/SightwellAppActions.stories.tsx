import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SightwellAppActions from "@/modules/setup-netbird-modal/SightwellAppActions";
import { padded } from "@/storybook/components";

/* Storybook runs on http://localhost, which the apps would refuse, so the
   setup modal stories render without these actions; this story passes the
   demo tenant explicitly. */
const meta: Meta<typeof SightwellAppActions> = {
  title: "Modules/Setup/SightwellAppActions",
  component: SightwellAppActions,
  decorators: [padded],
};
export default meta;

type Story = StoryObj<typeof SightwellAppActions>;

export const DemoTenant: Story = {
  args: {
    name: "Alder Cove Energy",
    target: {
      managementUrl: "https://aldercove-energy.sightwell.ai",
      host: "aldercove-energy.sightwell.ai",
    },
  },
};
