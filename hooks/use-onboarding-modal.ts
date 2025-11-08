import { useMiniKit } from "@coinbase/onchainkit/minikit"

import { useOnboarding } from "@/hooks/use-onboarding"

export function useOnboardingModal() {
  const { isFrameReady, context } = useMiniKit()
  const { showOnboardingModal, dismissOnboarding } = useOnboarding()

  const shouldShowOnboarding = () => showOnboardingModal

  const canSaveApp = (inMiniApp: boolean) =>
    Boolean(isFrameReady && inMiniApp && context?.client?.added !== true)

  return {
    showOnboardingModal,
    dismissOnboarding,
    shouldShowOnboarding,
    canSaveApp,
  }
}
