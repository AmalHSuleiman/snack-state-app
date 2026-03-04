// Uses Node.js built-in sqlite (stable in Node ≥ 23, experimental flag required in Node 22)
// No native compilation needed.
import { DatabaseSync } from "node:sqlite";
import path from "path";
import { SNACKS } from "@/data/snacks";
import type { Snack } from "./types";

const DB_PATH = path.join(process.cwd(), "snack-state.db");

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;
  _db = new DatabaseSync(DB_PATH);
  initSchema(_db);
  return _db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS snacks (
      id                INTEGER PRIMARY KEY,
      name              TEXT NOT NULL,
      ingredients       TEXT NOT NULL,
      prep_time_minutes INTEGER NOT NULL,
      tags              TEXT NOT NULL,
      nutrition         TEXT NOT NULL,
      warnings          TEXT NOT NULL,
      dietary           TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      event      TEXT NOT NULL,
      state      TEXT,
      snack_id   INTEGER,
      snack_name TEXT,
      hour       INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed snacks once if the table is empty
  const row = db.prepare("SELECT COUNT(*) AS c FROM snacks").get() as { c: number };
  if (row.c === 0) {
    const insert = db.prepare(`
      INSERT INTO snacks (id, name, ingredients, prep_time_minutes, tags, nutrition, warnings, dietary)
      VALUES ($id, $name, $ingredients, $prep_time_minutes, $tags, $nutrition, $warnings, $dietary)
    `);
    db.exec("BEGIN");
    try {
      for (const snack of SNACKS) {
        insert.run({
          $id: snack.id,
          $name: snack.name,
          $ingredients: JSON.stringify(snack.ingredients),
          $prep_time_minutes: snack.prep_time_minutes,
          $tags: JSON.stringify(snack.tags),
          $nutrition: JSON.stringify(snack.nutrition),
          $warnings: JSON.stringify(snack.warnings),
          $dietary: JSON.stringify(snack.dietary),
        });
      }
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  }
}

export function getAllSnacks(): Snack[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM snacks").all() as Record<string, unknown>[];
  return rows.map(deserializeSnack);
}

export function logEvent(params: {
  event: string;
  state?: string;
  snack_id?: number;
  snack_name?: string;
  hour?: number;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO events (event, state, snack_id, snack_name, hour)
    VALUES ($event, $state, $snack_id, $snack_name, $hour)
  `).run({
    $event: params.event,
    $state: params.state ?? null,
    $snack_id: params.snack_id ?? null,
    $snack_name: params.snack_name ?? null,
    $hour: params.hour ?? null,
  });
}

function deserializeSnack(row: Record<string, unknown>): Snack {
  return {
    id: row.id as number,
    name: row.name as string,
    ingredients: JSON.parse(row.ingredients as string),
    prep_time_minutes: row.prep_time_minutes as number,
    tags: JSON.parse(row.tags as string),
    nutrition: JSON.parse(row.nutrition as string),
    warnings: JSON.parse(row.warnings as string),
    dietary: JSON.parse(row.dietary as string),
  };
}
