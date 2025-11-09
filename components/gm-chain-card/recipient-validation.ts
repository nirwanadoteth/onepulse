import { isAddress } from "viem";

const isDomainFormat = (input: string): boolean => {
  if (!input.includes(".")) {
    return false;
  }
  return input.endsWith(".eth") || input.endsWith(".base.eth");
};

export const validateRecipient = (recipient: string): boolean => {
  const sanitized = recipient.trim();
  if (!sanitized) {
    return false;
  }

  const isValidAddress = isAddress(sanitized);
  const isValidDomain = isDomainFormat(sanitized);

  return isValidAddress || isValidDomain;
};
