import { describe, test, expect, beforeEach, afterEach } from "vitest"
import { removeProject } from "../../src/commands/remove"
import { setDataPath } from "../../src/config"
import { resetDb, db } from "../../src/db"
import { setupTestDatabase, cleanupTestDatabase, getTestDbPath } from "../fixtures/test-data"
import { ProjectTable, SessionTable } from "../../src/storage/schema"
import { join } from "path"
import { existsSync } from "fs"
import { eq } from "drizzle-orm"

describe("Remove Command", () => {
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
  
  test("should exit with error when project not found", async () => {
    const originalExit = process.exit
    let exitCode = 0
    process.exit = ((code: number) => { exitCode = code; throw new Error("exit") }) as any
    
    try {
      await removeProject(["non-existent-project-id"])
    } catch (error) {
      expect(error).toBeDefined()
    }
    
    expect(exitCode).toBe(1)
    process.exit = originalExit
  })
  
  test("should remove project and all associated data", async () => {
    const projects = await db.select().from(ProjectTable)
    
    if (projects.length === 0) {
      console.log("No projects in test database, skipping test")
      return
    }
    
    const projectId = projects[0]!.id
    
    const sessions = await db.select().from(SessionTable).where(eq(SessionTable.project_id, projectId))
    
    await removeProject([projectId])
    
    const deletedProject = await db.select().from(ProjectTable).where(eq(ProjectTable.id, projectId))
    expect(deletedProject.length).toBe(0)
    
    const deletedSessions = await db.select().from(SessionTable).where(eq(SessionTable.project_id, projectId))
    expect(deletedSessions.length).toBe(0)
    
    const projectSnapshot = join(testDir, "snapshot", projectId)
    expect(existsSync(projectSnapshot)).toBe(false)
    
    const projectWorktree = join(testDir, "worktree", projectId)
    expect(existsSync(projectWorktree)).toBe(false)
  })

  test("should remove multiple projects", async () => {
    const projects = await db.select().from(ProjectTable)
    
    if (projects.length < 2) {
      console.log("Not enough projects in test database, skipping test")
      return
    }
    
    const projectIds = [projects[0]!.id, projects[1]!.id]
    
    await removeProject(projectIds)
    
    for (const projectId of projectIds) {
      const deletedProject = await db.select().from(ProjectTable).where(eq(ProjectTable.id, projectId))
      expect(deletedProject.length).toBe(0)
      
      const deletedSessions = await db.select().from(SessionTable).where(eq(SessionTable.project_id, projectId))
      expect(deletedSessions.length).toBe(0)
    }
  })

  test("should handle mix of existing and non-existing projects", async () => {
    const originalExit = process.exit
    let exitCode = 0
    process.exit = ((code: number) => { exitCode = code; throw new Error("exit") }) as any
    
    const projects = await db.select().from(ProjectTable)
    
    if (projects.length === 0) {
      console.log("No projects in test database, skipping test")
      process.exit = originalExit
      return
    }
    
    const projectId = projects[0]!.id
    
    try {
      await removeProject([projectId, "non-existent-project"])
    } catch (error) {
      expect(error).toBeDefined()
    }
    
    expect(exitCode).toBe(1)
    
    const deletedProject = await db.select().from(ProjectTable).where(eq(ProjectTable.id, projectId))
    expect(deletedProject.length).toBe(0)
    
    process.exit = originalExit
  })
})
