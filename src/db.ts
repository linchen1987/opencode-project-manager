import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "./storage/schema"
import { config } from "./config"

let _db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!_db) {
    const sqlite = new Database(config.databasePath)
    _db = drizzle(sqlite, { schema })
  }
  return _db
}

export function resetDb() {
  if (_db) {
    const sqlite = (_db as any).session?.client
    if (sqlite) {
      sqlite.close()
    }
    _db = null
  }
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const database = getDb()
    return database[prop as keyof typeof database]
  },
})
