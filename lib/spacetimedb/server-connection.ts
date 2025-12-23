import type { Infer } from "spacetimedb";
import {
  DbConnection,
  type GmStatsByAddressV2Row,
} from "@/lib/module_bindings";

type GmStatsByAddress = Infer<typeof GmStatsByAddressV2Row>;

type SpacetimeDbConfig = {
  uri: string;
  moduleName: string;
  token: string;
};

function getSpacetimeDbConfig(): SpacetimeDbConfig {
  return {
    uri:
      process.env.SPACETIMEDB_HOST ||
      process.env.SPACETIMEDB_HOST_URL ||
      "wss://maincloud.spacetimedb.com",
    moduleName: process.env.SPACETIMEDB_MODULE || "onepulse",
    token: process.env.SPACETIMEDB_TOKEN || "",
  };
}

function createConnectionBuilder(config: SpacetimeDbConfig) {
  const builder = DbConnection.builder()
    .withUri(config.uri)
    .withModuleName(config.moduleName);
  if (config.token) {
    builder.withToken(config.token);
  }
  return builder;
}

export function buildServerDbConnection(): DbConnection {
  const config = getSpacetimeDbConfig();
  return createConnectionBuilder(config).build();
}

export function subscribeOnce(
  conn: DbConnection,
  queries: string[],
  timeoutMs = 10_000
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(
          new Error(`SpacetimeDB subscription timeout after ${timeoutMs}ms`)
        );
      }
    }, timeoutMs);

    try {
      conn
        .subscriptionBuilder()
        .onApplied(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve();
          }
        })
        .onError((ctx: unknown) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            const error =
              ctx instanceof Error ? ctx : new Error("Subscription error");
            reject(error);
          }
        })
        .subscribe(queries);
    } catch (error) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(error || new Error("Failed to create subscription"));
      }
    }
  });
}

export function connectServerDbConnection(
  timeoutMs = 30_000
): Promise<DbConnection> {
  const config = getSpacetimeDbConfig();
  return new Promise<DbConnection>((resolve, reject) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(
          new Error(
            `SpacetimeDB connection timeout after ${timeoutMs}ms. Ensure SPACETIMEDB_HOST is configured correctly.`
          )
        );
      }
    }, timeoutMs);

    try {
      createConnectionBuilder(config)
        .onConnect((connection) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(connection);
          }
        })
        .onConnectError((_ctx: unknown, error: Error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            reject(error || new Error("SpacetimeDB connection failed"));
          }
        })
        .build();
    } catch (error) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(error || new Error("Failed to create SpacetimeDB connection"));
      }
    }
  });
}

export async function getGmRows(
  address: string,
  chainId?: number
): Promise<GmStatsByAddress[]> {
  const conn = await connectServerDbConnection();

  try {
    const lowerAddress = address.toLowerCase();

    await subscribeOnce(conn, [
      `SELECT * FROM gm_stats_by_address_v2 WHERE address = '${address}'`,
      `SELECT * FROM gm_stats_by_address WHERE address = '${address}'`,
    ]);

    const v2Rows = Array.from(conn.db.gmStatsByAddressV2.iter()).filter(
      (r) => r.address.toLowerCase() === lowerAddress
    );

    const v2ChainIds = new Set(v2Rows.map((r) => r.chainId));

    const v1Rows = Array.from(conn.db.gmStatsByAddress.iter())
      .filter((r) => r.address.toLowerCase() === lowerAddress)
      .filter((r) => !v2ChainIds.has(r.chainId))
      .map(
        (v1) =>
          ({
            address: v1.address,
            chainId: v1.chainId,
            currentStreak: v1.currentStreak,
            highestStreak: v1.highestStreak,
            allTimeGmCount: v1.allTimeGmCount,
            lastGmDay: v1.lastGmDay,
            lastTxHash: v1.lastTxHash,
            fid: v1.fid,
            displayName: v1.displayName,
            username: v1.username,
            pfpUrl: undefined,
            primaryWallet: undefined,
            updatedAt: v1.updatedAt,
          }) as GmStatsByAddress
      );

    const all = [...v2Rows, ...v1Rows];

    if (typeof chainId === "number") {
      return all.filter((r) => r.chainId === chainId);
    }
    return all;
  } catch (error) {
    console.error(
      `[SpacetimeDB] Failed to fetch GM rows for ${address}:`,
      error
    );
    return [];
  } finally {
    try {
      conn.disconnect();
    } catch (error) {
      console.error("[SpacetimeDB] Failed to disconnect:", error);
    }
  }
}

export async function callReportGm(
  params: {
    address: string;
    chainId: number;
    lastGmDayOnchain: number;
    txHash: string | undefined;
    fid: bigint | undefined;
    displayName: string | undefined;
    username: string | undefined;
    primaryWallet: string | undefined;
    pfpUrl: string | undefined;
  },
  timeoutMs = 10_000
): Promise<GmStatsByAddress | null> {
  const conn = await connectServerDbConnection();

  try {
    const { address, chainId } = params;

    const query = `SELECT * FROM gm_stats_by_address_v2 WHERE address = '${address}' AND chain_id = ${chainId}`;
    await subscribeOnce(conn, [query]);

    console.log("[SpacetimeDB] Calling reportGm reducer with:", {
      address: params.address,
      chainId: params.chainId,
      lastGmDayOnchain: params.lastGmDayOnchain,
    });

    conn.reducers.reportGm({
      address: params.address,
      chainId: params.chainId,
      lastGmDayOnchain: params.lastGmDayOnchain,
      txHash: params.txHash,
      fid: params.fid,
      displayName: params.displayName,
      username: params.username,
      pfpUrl: params.pfpUrl,
      primaryWallet: params.primaryWallet,
    });

    console.log("[SpacetimeDB] Waiting for GM update...");
    const result = await waitForGmUpdate(conn, address, chainId, timeoutMs);
    console.log("[SpacetimeDB] GM update result:", result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[SpacetimeDB] Failed to report GM for ${params.address}:`,
      errorMessage
    );
    return null;
  } finally {
    try {
      conn.disconnect();
    } catch (error) {
      console.error("[SpacetimeDB] Failed to disconnect:", error);
    }
  }
}

function waitForGmUpdate(
  conn: DbConnection,
  address: string,
  chainId: number,
  timeoutMs: number
): Promise<GmStatsByAddress | null> {
  return new Promise((resolve) => {
    let resolved = false;

    const cleanup = () => {
      conn.db.gmStatsByAddressV2.removeOnInsert(handleInsert);
      conn.db.gmStatsByAddressV2.removeOnUpdate(handleUpdate);
    };

    const finish = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      cleanup();
      clearTimeout(timer);

      const rows = Array.from(conn.db.gmStatsByAddressV2.iter()).filter(
        (r) =>
          r.address.toLowerCase() === address.toLowerCase() &&
          r.chainId === chainId
      );
      resolve(rows[0] ?? null);
    };

    const handleInsert = () => {
      finish();
    };

    const handleUpdate = () => {
      finish();
    };

    conn.db.gmStatsByAddressV2.onInsert(handleInsert);
    conn.db.gmStatsByAddressV2.onUpdate(handleUpdate);

    const timer = setTimeout(() => {
      finish();
    }, timeoutMs);
  });
}
