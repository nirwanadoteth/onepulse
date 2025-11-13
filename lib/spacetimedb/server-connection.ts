import { DbConnection, type GmStatsByAddress } from "@/lib/module_bindings";

// Helper to resolve SpacetimeDB config from environment
function getSpacetimeDbConfig() {
  return {
    uri:
      process.env.SPACETIMEDB_HOST ||
      process.env.SPACETIMEDB_HOST_URL ||
      "wss://maincloud.spacetimedb.com",
    moduleName: process.env.SPACETIMEDB_MODULE || "onepulse",
    token: process.env.SPACETIMEDB_TOKEN || "",
  };
}

// Helper to create a DbConnection builder with config
function createDbConnectionBuilder(config: {
  uri: string;
  moduleName: string;
  token: string;
}) {
  const builder = DbConnection.builder()
    .withUri(config.uri)
    .withModuleName(config.moduleName);
  if (config.token) {
    builder.withToken(config.token);
  }
  return builder;
}

// Server-only SpacetimeDB connection builder
export function buildServerDbConnection(): DbConnection {
  const uri =
    process.env.SPACETIMEDB_HOST ||
    process.env.SPACETIMEDB_HOST_URL ||
    "wss://maincloud.spacetimedb.com";
  const moduleName = process.env.SPACETIMEDB_MODULE || "onepulse";
  const token = process.env.SPACETIMEDB_TOKEN || "";
  const builder = DbConnection.builder()
    .withUri(uri)
    .withModuleName(moduleName);
  if (token) {
    builder.withToken(token);
  }
  return builder.build();
}

export async function subscribeOnce(
  conn: DbConnection,
  queries: string[],
  timeoutMs = 3000
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("SpacetimeDB subscribe timeout"));
    }, timeoutMs);
    conn
      .subscriptionBuilder()
      .onApplied(() => {
        clearTimeout(timer);
        resolve();
      })
      .onError(() => {
        clearTimeout(timer);
        reject(new Error("SpacetimeDB subscribe error"));
      })
      .subscribe(queries);
  });
}

// Ensure connection is established before attempting subscribe/reducer calls
export async function connectServerDbConnection(
  timeoutMs = 5000
): Promise<DbConnection> {
  const config = getSpacetimeDbConfig();
  return await new Promise<DbConnection>((resolve, reject) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        reject(new Error("SpacetimeDB connect timeout"));
      }
    }, timeoutMs);

    const handleConnect = (connection: DbConnection) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(connection);
      }
    };
    const handleConnectError = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(new Error("SpacetimeDB connect error"));
      }
    };

    const builder = createDbConnectionBuilder(config)
      .onConnect(() => handleConnect(built))
      .onConnectError(handleConnectError);
    const built = builder.build();
  });
}

export async function getGmRows(
  address: string,
  chainId?: number
): Promise<GmStatsByAddress[]> {
  const conn = await connectServerDbConnection();
  try {
    const filters: string[] = [
      `SELECT * FROM gm_stats_by_address WHERE address = '${address}'`,
    ];
    await subscribeOnce(conn, filters);

    const all = Array.from(conn.db.gmStatsByAddress.iter());
    const rows = all.filter(
      (r) => r.address.toLowerCase() === address.toLowerCase()
    );
    if (typeof chainId === "number") {
      return rows.filter((r) => r.chainId === chainId);
    }
    return rows;
  } finally {
    // Always disconnect since API routes are ephemeral
    conn.disconnect();
  }
}

export async function callReportGm(
  params: {
    address: string;
    chainId: number;
    lastGmDayOnchain: number;
    txHash?: string;
    fid?: bigint;
    displayName?: string;
    username?: string;
  },
  timeoutMs = 4000
): Promise<GmStatsByAddress | null> {
  const conn = await connectServerDbConnection();
  try {
    const { address, chainId } = params;
    // Subscribe first so cache is primed, then call reducer
    await subscribeOnce(conn, [
      `SELECT * FROM gm_stats_by_address WHERE address = '${address}' AND chain_id = ${chainId}`,
    ]);

    // Wait for insert/update event after reducer call
    const updated = new Promise<GmStatsByAddress | null>((resolve) => {
      let resolved = false;
      const finish = () => {
        if (resolved) {
          return;
        }
        resolved = true;
        const rows = Array.from(conn.db.gmStatsByAddress.iter()).filter(
          (r) =>
            r.address.toLowerCase() === address.toLowerCase() &&
            r.chainId === chainId
        );
        resolve(rows[0] ?? null);
      };
      const onInsertCb = () => finish();
      const onUpdateCb = () => finish();
      conn.db.gmStatsByAddress.onInsert(onInsertCb);
      conn.db.gmStatsByAddress.onUpdate(onUpdateCb);
      setTimeout(() => {
        conn.db.gmStatsByAddress.removeOnInsert(onInsertCb);
        conn.db.gmStatsByAddress.removeOnUpdate(onUpdateCb);
        finish(); // fallback if no event observed
      }, timeoutMs);
    });

    conn.reducers.reportGm(
      params.address,
      params.chainId,
      params.lastGmDayOnchain,
      params.txHash,
      params.fid,
      params.displayName,
      params.username
    );

    return await updated;
  } finally {
    conn.disconnect();
  }
}
