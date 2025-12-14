import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";

async function verifyFidWithQuickAuth(
  token: string | null
): Promise<number | undefined> {
  try {
    const response = await sdk.quickAuth.fetch("/api/auth", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return;
    }

    let data: { success?: boolean; user?: { fid?: number } };
    try {
      data = (await response.json()) as {
        success?: boolean;
        user?: { fid?: number };
      };
    } catch {
      return;
    }

    if (data.success && data.user?.fid) {
      return data.user.fid;
    }
  } catch {
    toast.error("Failed to verify FID");
  }
}

async function getToken(): Promise<string | null> {
  try {
    const { token } = await sdk.quickAuth.getToken();
    return token;
  } catch {
    return null;
  }
}

export async function signIn(): Promise<number | undefined> {
  try {
    const authJWT = await getToken();
    const verifiedFid = await verifyFidWithQuickAuth(authJWT);
    return verifiedFid;
  } catch {
    return;
  }
}
