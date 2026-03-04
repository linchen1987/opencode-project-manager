import { describe, test, expect, beforeEach, afterEach } from "vitest"
import { listProjects } from "../../src/commands/list"
import { setDataPath } from "../../src/config"
import { resetDb } from "../../src/db"
import { setupTestDatabase, cleanupTestDatabase, getTestDbPath } from "../fixtures/test-data"
import { join } from "path"
import { mkdirSync, rmSync } from "fs"
import { tmpdir } from "os"

describe("List Command", () => {
  let testDir: string
  
  beforeEach(() => {
    testDir = setupTestDatabase()
    setDataPath(getTestDbPath(testDir))
    resetDb()
  })
  
  afterEach(() => {
    cleanupTestDatabase(testDir)
    setDataPath(undefined)
    resetDb()
  })
  
  test("should list projects from database", async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: any[]) => logs.push(args.join(' '))
    
    await listProjects()
    
    console.log = originalLog
    const output = logs.join(' ')
    expect(output).toContain("Total:")
    expect(output).toMatch(/\d+\s+project\(s\)/)
  })
  
  test("should show project details in table format", async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: any[]) => logs.push(args.join(' '))
    
    await listProjects()
    
    console.log = originalLog
    const output = logs.join(' ')
    
    expect(output).toContain("ID")
    expect(output).toContain("Worktree")
    expect(output).toContain("Sessions")
    expect(output).toContain("Messages")
    expect(output).toContain("Parts")
    expect(output).toContain("Todos")
    expect(output).toContain("Updated")
  })
})
