import Button from "@components/Button";
import * as React from "react";
import { Policy } from "@/interfaces/Policy";
import { OnboardingPolicy } from "@/modules/onboarding/OnboardingPolicy";

type Props = {
  policy?: Policy;
  onNext?: () => void;
  onToggle?: (policy: Policy) => void;
};

export const OnboardingExplainPolicy = ({
  policy,
  onNext,
  onToggle,
}: Props) => {
  return (
    <div className={"relative flex flex-col h-full gap-4"}>
      <div>
        <h1 className={"text-xl text-center max-w-sm mx-auto"}>
            {`Set the rules. You're in control`}
        </h1>
        <div
          className={
            "text-sm text-nb-gray-300 font-light mt-2 block text-center sm:px-4"
          }
        >
            {`Access control policies let you enforce least-privilege access to every site and system.
            We've already created one for your resource during setup.`}
        </div>

        {policy && (
          <div
            className={
              "text-sm text-nb-gray-300 font-light mt-2 block text-center sm:px-4"
            }
          >
              Flip the switch, then try pinging your resource again to see how it affects the connection.
          </div>
        )}
      </div>

      <div>
        <OnboardingPolicy policy={policy} onToggle={onToggle} />
      </div>

      <Button variant={"primary"} onClick={onNext}>
        Continue
      </Button>
    </div>
  );
};
