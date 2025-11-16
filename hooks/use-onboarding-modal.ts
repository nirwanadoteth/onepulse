import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { useOnboarding } from "@/hooks/use-onboarding";

export function useOnboardingModal() {
  const { isMiniAppReady } = useMiniKit();
  const miniAppContext = useMiniAppContext();
  const { showOnboardingModal, dismissOnboarding } = useOnboarding();

  const shouldShowOnboarding = () => showOnboardingModal;

  const canSaveApp = (inMiniApp: boolean) =>
    Boolean(
      isMiniAppReady &&
        inMiniApp &&
        miniAppContext?.context?.client.added !== true
    );

  return {
    showOnboardingModal,
    dismissOnboarding,
    shouldShowOnboarding,
    canSaveApp,
  };
}
