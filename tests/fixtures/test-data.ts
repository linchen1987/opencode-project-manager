import { join } from "path"
import { tmpdir } from "os"
import { mkdirSync, cpSync, rmSync, existsSync } from "fs"

const DEBUG_DATA_PATH = join(process.cwd(), "tests", "fixtures", "opencode")

export function setupTestDatabase(): string {
  const testDir = join(tmpdir(), `opencode-test-${Date.now()}`)
  mkdirSync(testDir, { recursive: true })
  
  if (existsSync(DEBUG_DATA_PATH)) {
    cpSync(DEBUG_DATA_PATH, testDir, { recursive: true })
  } else {
    mkdirSync(join(testDir, "storage"), { recursive: true })
    mkdirSync(join(testDir, "snapshot"), { recursive: true })
    mkdirSync(join(testDir, "worktree"), { recursive: true })
  }
  
  return testDir
}

export function cleanupTestDatabase(testDir: string) {
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true, force: true })
  }
}

export function getTestDbPath(testDir: string): string {
  return join(testDir, "opencode.db")
}
