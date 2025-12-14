import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";
import { z } from "zod";

const authResponseSchema = z.object({
  success: z.boolean().optional(),
  user: z
    .object({
      fid: z.number().optional(),
    })
    .optional(),
});

async function verifyFidWithQuickAuth(
  token: string | null
): Promise<number | undefined> {
  try {
    if (!token) {
      return;
    }
    const response = await sdk.quickAuth.fetch("/api/auth", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return;
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return;
    }

    const validationResult = authResponseSchema.safeParse(json);
    if (!validationResult.success) {
      return;
    }

    const data = validationResult.data;
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
