import { useQuery } from "@tanstack/react-query";

export function useHiddenChains() {
  return useQuery({
    queryKey: ["hidden-chains"],
    queryFn: async () => {
      const response = await fetch("/api/chains/visibility");
      if (!response.ok) {
        throw new Error("Failed to fetch hidden chains");
      }
      const data = await response.json();
      return data.hiddenChains as number[];
    },
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

export function useToggleChainVisibility() {
  return async (chainId: number, adminAddress: string) => {
    const response = await fetch("/api/admin/chains/visibility", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chainId,
        adminAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to toggle chain visibility");
    }

    return response.json();
  };
}
