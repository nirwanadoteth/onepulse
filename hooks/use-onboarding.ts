import { useSyncExternalStore } from "react"

const ONBOARDING_KEY = "onepulse:onboarded"
const onboardingLocalListeners = new Set<() => void>()

function subscribeOnboarding(listener: () => void) {
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener)
  }
  onboardingLocalListeners.add(listener)
  return () => {
    onboardingLocalListeners.delete(listener)
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener)
    }
  }
}

function getOnboardingSnapshot() {
  try {
    if (typeof window === "undefined") return false
    return !window.localStorage.getItem(ONBOARDING_KEY)
  } catch {
    return false
  }
}

function getOnboardingServerSnapshot() {
  return false
}

export function useOnboarding() {
  const showOnboardingModal = useSyncExternalStore(
    subscribeOnboarding,
    getOnboardingSnapshot,
    getOnboardingServerSnapshot
  )

  const dismissOnboarding = () => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "1")
      onboardingLocalListeners.forEach((l) => l())
    } catch {
      // Handle error silently
    }
  }

  return { showOnboardingModal, dismissOnboarding }
}
