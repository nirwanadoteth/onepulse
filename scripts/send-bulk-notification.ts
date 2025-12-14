#!/usr/bin/env bun
/**
 * Bulk Notification Script
 *
 * Sends notifications to all users stored in Redis KV.
 *
 * Usage:
 *   bun scripts/send-bulk-notification.ts --title 'Your Title' --body 'Your message'
 *
 * Options:
 *   --title, -t           Notification title (required)
 *   --body, -b            Notification body (required)
 *   --notification-id, -n Stable notification ID for deduplication (default: daily-reminder-{date})
 *   --batch-size          Number of concurrent requests (default: 10)
 *   --dry-run             Preview without sending (default: false)
 *   --delay               Delay between batches in ms (default: 100)
 *
 * Note: Use single quotes for arguments containing ! (zsh interprets ! in double quotes)
 *
 * Examples:
 *   bun scripts/send-bulk-notification.ts -t 'GM!' -b 'Rise and shine!'
 *   bun scripts/send-bulk-notification.ts -t 'Update' -b 'New features!' --dry-run
 *   bun scripts/send-bulk-notification.ts -t 'GM!' -b 'Hello!' -n 'gm-reminder-2024-12-03'
 */

import { parseArgs } from "node:util";

import { handleError } from "@/lib/error-handling";

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

type UserInfo = {
  fid: number;
  appFid: number;
};

type NotificationResult = {
  fid: number;
  success: boolean;
  error?: string;
};

type ScanResult = {
  result: [string, string[]];
};

type NotificationConfig = {
  title: string;
  body: string;
  apiUrl: string;
  notificationId: string;
};

const USER_KEY_REGEX = /onepulse:user:(\d+):(\d+)$/;

async function scanAllKeys(pattern: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = "0";

  do {
    const response = await fetch(
      `${KV_URL}/scan/${cursor}?match=${encodeURIComponent(pattern)}&count=100`,
      {
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to scan keys: ${response.statusText}`);
    }

    const data = (await response.json()) as ScanResult;
    cursor = data.result[0];
    keys.push(...data.result[1]);
  } while (cursor !== "0");

  return keys;
}

function extractUserFromKey(key: string): UserInfo | null {
  const match = key.match(USER_KEY_REGEX);
  if (!match?.[1]) {
    return null;
  }
  if (!match[2]) {
    return null;
  }
  return {
    appFid: Number.parseInt(match[1], 10),
    fid: Number.parseInt(match[2], 10),
  };
}

async function sendNotification(
  user: UserInfo,
  config: NotificationConfig
): Promise<NotificationResult> {
  try {
    const response = await fetch(`${config.apiUrl}/api/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fid: user.fid,
        appFid: user.appFid,
        notificationId: config.notificationId,
        notification: { title: config.title, body: config.body },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        fid: user.fid,
        success: false,
        error: data.error || "Unknown error",
      };
    }

    return { fid: user.fid, success: true };
  } catch (error) {
    return {
      fid: user.fid,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function processBatch(
  users: UserInfo[],
  config: NotificationConfig
): Promise<NotificationResult[]> {
  const promises = users.map((user) => sendNotification(user, config));
  return await Promise.all(promises);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateInputs(
  title: string | undefined,
  body: string | undefined
): void {
  if (!title) {
    handleError(
      new Error("--title is required"),
      "--title is required",
      {
        operation: "scripts/send-bulk-notification",
      },
      { silent: true }
    );
    process.stderr.write(
      "\nUsage: bun scripts/send-bulk-notification.ts --title 'Title' --body 'Message'\n"
    );
    process.exit(1);
  }
  if (!body) {
    handleError(
      new Error("--body is required"),
      "--body is required",
      {
        operation: "scripts/send-bulk-notification",
      },
      { silent: true }
    );
    process.stderr.write(
      "\nUsage: bun scripts/send-bulk-notification.ts --title 'Title' --body 'Message'\n"
    );
    process.exit(1);
  }
}

function validateEnv(): void {
  if (!KV_URL) {
    handleError(
      new Error("KV_REST_API_URL is required"),
      "KV_REST_API_URL is required",
      { operation: "scripts/send-bulk-notification" },
      { silent: true }
    );
    process.exit(1);
  }
  if (!KV_TOKEN) {
    handleError(
      new Error("KV_REST_API_TOKEN is required"),
      "KV_REST_API_TOKEN is required",
      { operation: "scripts/send-bulk-notification" },
      { silent: true }
    );
    process.exit(1);
  }
}

function printSummary(results: NotificationResult[], totalUsers: number): void {
  const totalSuccess = results.filter((r) => r.success).length;
  const totalFailed = results.filter((r) => !r.success).length;

  console.log(`\n${"=".repeat(50)}`);
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total users: ${totalUsers}`);
  console.log(`✅ Successful: ${totalSuccess}`);
  console.log(`❌ Failed: ${totalFailed}`);

  if (totalFailed > 0) {
    console.log("\n❌ Failed notifications:");
    const failures = results.filter((r) => !r.success);
    for (const failure of failures.slice(0, 10)) {
      console.log(`   FID ${failure.fid}: ${failure.error}`);
    }
    if (failures.length > 10) {
      console.log(`   ... and ${failures.length - 10} more`);
    }
  }
}

async function sendBulkNotifications(
  users: UserInfo[],
  config: NotificationConfig,
  batchSize: number,
  delay: number
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];
  const batches = Math.ceil(users.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, users.length);
    const batch = users.slice(start, end);

    console.log(
      `\n📦 Processing batch ${i + 1}/${batches} (${batch.length} users)`
    );

    const batchResults = await processBatch(batch, config);
    results.push(...batchResults);

    const successful = batchResults.filter((r) => r.success).length;
    const failed = batchResults.filter((r) => !r.success).length;
    console.log(`   ✅ ${successful} success, ❌ ${failed} failed`);

    if (i < batches - 1) {
      await sleep(delay);
    }
  }

  return results;
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      title: { type: "string", short: "t" },
      body: { type: "string", short: "b" },
      "notification-id": { type: "string", short: "n" },
      "batch-size": { type: "string" },
      "dry-run": { type: "boolean" },
      delay: { type: "string" },
    },
    strict: true,
    allowPositionals: false,
  });

  const title = values.title;
  const body = values.body;
  const batchSize = Number.parseInt(values["batch-size"] || "10", 10);
  const dryRun = values["dry-run"] ?? false;
  const delay = Number.parseInt(values.delay || "100", 10);

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const notificationId =
    values["notification-id"] || `daily-reminder-${dateStr}`;

  validateInputs(title, body);
  validateEnv();

  console.log("🔍 Scanning Redis for users...");
  console.log("   Pattern: onepulse:user:*:*");

  const keys = await scanAllKeys("onepulse:user:*:*");
  const users = keys
    .map(extractUserFromKey)
    .filter((user): user is UserInfo => user !== null);

  console.log(`\n📊 Found ${users.length} users`);
  console.log(`📝 Title: "${title}"`);
  console.log(`📝 Body: "${body}"`);
  console.log(`🔑 Notification ID: "${notificationId}"`);
  console.log(`⚙️  Batch size: ${batchSize}`);
  console.log(`⚙️  Delay between batches: ${delay}ms`);

  if (dryRun) {
    console.log("\n🧪 DRY RUN - No notifications will be sent");
    console.log(`\nWould send to ${users.length} users:`);
    const fidList = users.slice(0, 20).map((u) => u.fid);
    console.log(fidList.join(", ") + (users.length > 20 ? "..." : ""));
    return;
  }

  if (users.length === 0) {
    console.log("\n⚠️  No users found. Exiting.");
    return;
  }

  console.log("\n🚀 Starting bulk notification send...");

  const config: NotificationConfig = {
    title: title as string,
    body: body as string,
    apiUrl: DEFAULT_API_URL,
    notificationId,
  };

  const results = await sendBulkNotifications(users, config, batchSize, delay);
  printSummary(results, users.length);

  console.log("\n✨ Done!");
}

main().catch((error) => {
  handleError(
    error,
    "Fatal error",
    { operation: "scripts/send-bulk-notification" },
    { silent: true }
  );
  process.exit(1);
});
