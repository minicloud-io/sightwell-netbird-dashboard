import { cn } from "@utils/helpers";
import BrandSpinner from "@/branding/BrandSpinner";

type Props = {
  fullScreen?: boolean;
};
// Fork-specific: the Sightwell spinner instead of upstream's LoadingIcon bars.
export default function FullScreenLoading({ fullScreen = true }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-screen",
        fullScreen && "h-screen",
      )}
    >
      <BrandSpinner size={44} />
    </div>
  );
}
