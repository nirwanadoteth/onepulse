/**
 * Truncate an Ethereum address to a readable format (0x...XXXX)
 * @param address The full address
 * @param chars Number of characters to show from the start and end (default: 4)
 * @returns Truncated address
 */
export function truncateAddress(
  address: string | undefined,
  chars = 4
): string {
  if (!address) {
    return "";
  }
  if (address.length < 10) {
    return address;
  }
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
