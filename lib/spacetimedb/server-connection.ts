import type { Infer } from "spacetimedb";
import { DbConnection } from "@/lib/module_bindings";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

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
    const query = `SELECT * FROM gm_stats_by_address WHERE address = '${address}'`;
    await subscribeOnce(conn, [query]);

    const all = Array.from(conn.db.gmStatsByAddress.iter());
    const filtered = all.filter(
      (r) => r.address.toLowerCase() === address.toLowerCase()
    );

    if (typeof chainId === "number") {
      return filtered.filter((r) => r.chainId === chainId);
    }
    return filtered;
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
  },
  timeoutMs = 10_000
): Promise<GmStatsByAddress | null> {
  const conn = await connectServerDbConnection();

  try {
    const { address, chainId } = params;

    const query = `SELECT * FROM gm_stats_by_address WHERE address = '${address}' AND chain_id = ${chainId}`;
    await subscribeOnce(conn, [query]);

    conn.reducers.reportGm(params);

    return await waitForGmUpdate(conn, address, chainId, timeoutMs);
  } catch (error) {
    console.error(
      `[SpacetimeDB] Failed to report GM for ${params.address}:`,
      error
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
      conn.db.gmStatsByAddress.removeOnInsert(handleInsert);
      conn.db.gmStatsByAddress.removeOnUpdate(handleUpdate);
    };

    const finish = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      cleanup();
      clearTimeout(timer);

      const rows = Array.from(conn.db.gmStatsByAddress.iter()).filter(
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

    conn.db.gmStatsByAddress.onInsert(handleInsert);
    conn.db.gmStatsByAddress.onUpdate(handleUpdate);

    const timer = setTimeout(() => {
      finish();
    }, timeoutMs);
  });
}
