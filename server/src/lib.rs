use spacetimedb::{table, reducer, Table, ReducerContext, Timestamp};

#[reducer(init)]
pub fn init(_ctx: &ReducerContext) {
    // Called when the module is initially published
}

#[reducer(client_connected)]
pub fn identity_connected(_ctx: &ReducerContext) {
    // Called everytime a new client connects
}

#[reducer(client_disconnected)]
pub fn identity_disconnected(_ctx: &ReducerContext) {
    // Called everytime a client disconnects
}

// Helper to compose a primary key from address + chain_id
fn pk_for(address: &str, chain_id: i32) -> String {
    format!("{}:{}", address, chain_id)
}

#[table(
    name = gm_stats_by_address,
    public,
    index(name = address_chainid, btree(columns = [address, chain_id])),
    index(name = address, btree(columns = [address])),
    index(name = chain_id, btree(columns = [chain_id])),
    index(name = updated_at, btree(columns = [updated_at]))
)]
#[derive(Clone)]
pub struct GmStatsByAddress {
    // Primary key is a combination of address and chain_id, stored as a single composite string "address:chain_id"
    #[primary_key]
    address_chain: String,

    // Address and chain_id are stored as separate fields for convenient querying
    address: String,

    chain_id: i32,

    current_streak: i32,
    highest_streak: i32,
    all_time_gm_count: i32,
    last_gm_day: i32,

    last_tx_hash: Option<String>,
    fid: Option<i64>,
    display_name: Option<String>,
    username: Option<String>,

    updated_at: Timestamp,
}

#[reducer]
pub fn report_gm(
    ctx: &ReducerContext,
    address: String,
    chain_id: i32,
    last_gm_day_onchain: i32, // Pass onchain value in request
    tx_hash: Option<String>,
    fid: Option<i64>,
    display_name: Option<String>,
    username: Option<String>,
) -> Result<(), String> {
    let addr = address.trim();
    let pk = pk_for(addr, chain_id);
    // Try to find an existing record
    if let Some(mut stats) = ctx.db.gm_stats_by_address().address_chain().find(&pk) {
        let mut current_streak = stats.current_streak;
        let mut highest_streak = stats.highest_streak;
        let mut all_time_gm_count = stats.all_time_gm_count;
        let mut last_gm_day = stats.last_gm_day;

        if last_gm_day_onchain > last_gm_day {
            let delta = last_gm_day_onchain - last_gm_day;
            if delta == 1 {
                current_streak += 1;
            } else {
                current_streak = 1;
            }
            highest_streak = highest_streak.max(current_streak);
            all_time_gm_count += 1;
            last_gm_day = last_gm_day_onchain;
        }

        stats.current_streak = current_streak;
        stats.highest_streak = highest_streak;
        stats.all_time_gm_count = all_time_gm_count;
        stats.last_gm_day = last_gm_day;
        stats.last_tx_hash = tx_hash.or(stats.last_tx_hash);
        stats.fid = fid.or(stats.fid);
        stats.display_name = display_name.or(stats.display_name);
        stats.username = username.or(stats.username);
        stats.updated_at = ctx.timestamp;

        ctx.db.gm_stats_by_address().address_chain().update(stats);
    } else {
        ctx.db.gm_stats_by_address().insert(GmStatsByAddress {
            address_chain: pk,
            address: addr.to_string(),
            chain_id,
            current_streak: 1,
            highest_streak: 1,
            all_time_gm_count: 1,
            last_gm_day: last_gm_day_onchain,
            last_tx_hash: tx_hash,
            fid,
            display_name,
            username,
            updated_at: ctx.timestamp,
        });
    }
    Ok(())
}
