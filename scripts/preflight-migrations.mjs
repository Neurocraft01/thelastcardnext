import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const migrationsDir = path.join(repoRoot, "supabase", "migrations");

if (!fs.existsSync(migrationsDir)) {
  console.error("Missing migrations directory: supabase/migrations");
  process.exit(1);
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No SQL migrations found in supabase/migrations");
  process.exit(1);
}

const requiredTables = ["orders", "payments", "assets", "profiles", "audit_logs", "payment_events", "reconciliation_jobs"];
const combined = files
  .map((name) => fs.readFileSync(path.join(migrationsDir, name), "utf8").toLowerCase())
  .join("\n");

for (const table of requiredTables) {
  const marker = `create table if not exists public.${table}`;
  if (!combined.includes(marker)) {
    console.error(`Missing required migration table definition: ${marker}`);
    process.exit(1);
  }
}

if (!combined.includes("enable row level security")) {
  console.error("Expected at least one RLS enable statement in migrations");
  process.exit(1);
}

console.log(`Migration preflight passed. Checked ${files.length} SQL files.`);
