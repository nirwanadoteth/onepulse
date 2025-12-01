export function useMiniAppRequiredLogic() {
  const handleOpenInApp = () => {
    const appUrl = window.location.href;
    // Try to open in Warpcast (Farcaster) or Base app
    window.open(
      `https://farcaster.xyz/?launchFrameUrl=${encodeURIComponent(appUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return {
    handleOpenInApp,
  };
}
