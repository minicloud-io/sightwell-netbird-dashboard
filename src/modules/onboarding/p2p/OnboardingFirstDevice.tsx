import Button from "@components/Button";
import { Modal, ModalContent } from "@components/modal/Modal";
import { DownloadIcon } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Peer } from "@/interfaces/Peer";
import { SetupModalContent } from "@/modules/setup-netbird-modal/SetupModal";

type Props = {
  onBack: () => void;
  firstDevice?: Peer;
  onFinish?: () => void;
};

export const OnboardingFirstDevice = ({
  onBack,
  firstDevice,
  onFinish,
}: Props) => {
  const [open, setOpen] = useState(false);

  /**
   * Continue to next step once first device is recognized
   */
  useEffect(() => {
    firstDevice && onFinish?.();
  }, [firstDevice]);

  return (
    <div className={"relative flex flex-col h-full gap-4"}>
      <div>
        <h1 className={"text-xl text-center"}>
          {`Let's get your first machine online`}
        </h1>
        <div
          className={
            "text-sm text-nb-gray-300 font-light mt-2 block text-center sm:px-4"
          }
        >
          {`Install the NetBird client on a machine, such as a collector at a site or a server that needs to reach one, and sign in. The machine joins the network as a peer.
          Every machine you add becomes a peer with its own private address.`}
        </div>
      </div>

      <div className={"flex items-center justify-center mt-4 gap-3"}>
        <Button variant={"secondary"} onClick={onBack}>
          Go Back
        </Button>
        <Button variant={"primary"} onClick={() => setOpen(true)}>
          <DownloadIcon size={16} />
          Install the NetBird client
        </Button>
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className={"!z-[70]"}>
          <SetupModalContent title={"Install the NetBird client"} isUserDevice={true} />
        </ModalContent>
      </Modal>
    </div>
  );
};
