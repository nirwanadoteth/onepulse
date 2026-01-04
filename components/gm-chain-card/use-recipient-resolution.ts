import { useBasenameResolver } from "@/hooks/use-basename-resolver";
import { validateRecipient } from "./recipient-validation";

export const useRecipientResolution = (recipient: string) => {
  const sanitizedRecipient = recipient.trim();
  const isRecipientValid = validateRecipient(recipient);

  const { address: resolvedAddress, isLoading: isResolving } =
    useBasenameResolver(recipient);

  return {
    sanitizedRecipient,
    isRecipientValid,
    resolvedAddress,
    isResolving,
  };
};
