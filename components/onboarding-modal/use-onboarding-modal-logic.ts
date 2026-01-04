export function useOnboardingModalLogic(
  onClose: () => void,
  onSave?: () => void
) {
  const handleSaveAndClose = () => {
    onSave?.();
    onClose();
  };

  return {
    handleSaveAndClose,
  };
}
