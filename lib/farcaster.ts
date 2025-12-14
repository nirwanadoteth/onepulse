export type FarcasterUser = {
  fid: number;
  username: string;
  displayName: string;
  pfp: {
    url: string;
    verified: boolean;
  };
};

export type FarcasterUserResponse = {
  result: {
    user: FarcasterUser;
  };
};

export async function fetchFarcasterUser(
  fid: number
): Promise<FarcasterUser | null> {
  try {
    const response = await fetch(
      `https://api.farcaster.xyz/v2/user?fid=${fid}`
    );
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as FarcasterUserResponse;
    return data.result.user;
  } catch (error) {
    console.error("Error fetching Farcaster user:", error);
    return null;
  }
}
