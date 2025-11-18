import { isAddress } from "viem";

import { isDomainFormat } from "@/lib/utils";

export const validateRecipient = (recipient: string): boolean => {
  const sanitized = recipient.trim();
  if (!sanitized) {
    return false;
  }

  const isValidAddress = isAddress(sanitized);
  const isValidDomain = isDomainFormat(sanitized);

  return isValidAddress || isValidDomain;
};
