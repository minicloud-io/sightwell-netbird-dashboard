import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Intent, Onboarding } from "@/modules/onboarding/Onboarding";
import { settle, waitForSelector } from "@/storybook/platform";

type Args = { intent: Intent; step: number };

/* The regular onboarding a new tenant owner sees after the first sign-in (the
   OnboardingProvider opens it while onboarding_flow_pending is set). Rendering
   it directly per step shows each step without walking the flow. No peers are
   connected, so the device steps stay on their waiting state instead of
   advancing on their own. */
const meta: Meta<Args> = {
  title: "Pages/Platform/Onboarding",
  parameters: {
    nextjs: { navigation: { pathname: "/peers" } },
    api: { "GET /peers": [] },
  },
  render: ({ intent, step }) => (
    <DashboardLayout>
      <Onboarding
        initial={{ intent, step }}
        setLocalOnboarding={() => undefined}
        peers={[]}
        onSkip={() => undefined}
        onFinish={() => undefined}
        formSubmitted={true}
        isOnboardingPending={true}
      />
    </DashboardLayout>
  ),
  play: async () => {
    await waitForSelector("[data-testid=regular-onboarding]");
    await settle(800);
  },
};
export default meta;
type Story = StoryObj<Args>;

export const ChooseIntent: Story = { args: { intent: Intent.P2P, step: 2 } };
export const FirstMachine: Story = { args: { intent: Intent.P2P, step: 3 } };
export const SecondMachine: Story = { args: { intent: Intent.P2P, step: 4 } };
export const AddResource: Story = {
  args: { intent: Intent.NETWORKS, step: 3 },
};
export const AddRoutingPeer: Story = {
  args: { intent: Intent.NETWORKS, step: 4 },
};
export const Finished: Story = { args: { intent: Intent.P2P, step: 7 } };
