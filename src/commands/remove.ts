import { db } from "../db"
import { ProjectTable, SessionTable, MessageTable, PartTable, TodoTable, PermissionTable, WorkspaceTable } from "../storage/schema"
import { eq, inArray } from "drizzle-orm"
import chalk from "chalk"
import { config } from "../config"
import { dirname, join } from "path"
import { rmSync, existsSync, readdirSync } from "fs"

async function removeSingleProject(projectId: string) {
  const project = await db
    .select()
    .from(ProjectTable)
    .where(eq(ProjectTable.id, projectId))
    .limit(1)

  if (project.length === 0) {
    console.log(chalk.red(`Project with ID "${projectId}" not found.`))
    return false
  }

  // Get all sessions for this project (needed for file cleanup and database deletion)
  const sessions = await db
    .select({ id: SessionTable.id })
    .from(SessionTable)
    .where(eq(SessionTable.project_id, projectId))

  const dataDir = dirname(config.databasePath)

  // Delete session diff files
  const sessionDiffDir = join(dataDir, "storage", "session_diff")
  for (const session of sessions) {
    const sessionDiffFile = join(sessionDiffDir, `${session.id}.json`)
    if (existsSync(sessionDiffFile)) {
      rmSync(sessionDiffFile, { force: true })
      console.log(chalk.gray(`  Deleted session diff: ${session.id}.json`))
    }
  }

  const snapshotDir = join(dataDir, "snapshot", projectId)
  if (existsSync(snapshotDir)) {
    rmSync(snapshotDir, { recursive: true, force: true })
    console.log(chalk.gray(`  Deleted snapshot directory: snapshot/${projectId}/`))
  }

  const worktreeDir = join(dataDir, "worktree", projectId)
  if (existsSync(worktreeDir)) {
    rmSync(worktreeDir, { recursive: true, force: true })
    console.log(chalk.gray(`  Deleted worktree directory: worktree/${projectId}/`))
  }

  // Delete database records and show what's being deleted
  console.log(chalk.gray(`  Deleting database records...`))
  
  if (sessions.length > 0) {
    const sessionIds = sessions.map(s => s.id)
    
    // Count and delete parts
    const parts = await db
      .select({ id: PartTable.id })
      .from(PartTable)
      .where(inArray(PartTable.session_id, sessionIds))
    if (parts.length > 0) {
      await db.delete(PartTable).where(inArray(PartTable.session_id, sessionIds))
      console.log(chalk.gray(`    Deleted ${parts.length} parts`))
    }
    
    // Count and delete messages
    const messages = await db
      .select({ id: MessageTable.id })
      .from(MessageTable)
      .where(inArray(MessageTable.session_id, sessionIds))
    if (messages.length > 0) {
      await db.delete(MessageTable).where(inArray(MessageTable.session_id, sessionIds))
      console.log(chalk.gray(`    Deleted ${messages.length} messages`))
    }
    
    // Count and delete todos
    const todos = await db
      .select()
      .from(TodoTable)
      .where(inArray(TodoTable.session_id, sessionIds))
    if (todos.length > 0) {
      await db.delete(TodoTable).where(inArray(TodoTable.session_id, sessionIds))
      console.log(chalk.gray(`    Deleted ${todos.length} todos`))
    }
    
    // Delete sessions
    await db.delete(SessionTable).where(eq(SessionTable.project_id, projectId))
    console.log(chalk.gray(`    Deleted ${sessions.length} sessions`))
  }
  
  // Delete permissions
  const permissions = await db
    .select()
    .from(PermissionTable)
    .where(eq(PermissionTable.project_id, projectId))
  if (permissions.length > 0) {
    await db.delete(PermissionTable).where(eq(PermissionTable.project_id, projectId))
    console.log(chalk.gray(`    Deleted ${permissions.length} permissions`))
  }
  
  // Delete workspaces
  const workspaces = await db
    .select()
    .from(WorkspaceTable)
    .where(eq(WorkspaceTable.project_id, projectId))
  if (workspaces.length > 0) {
    await db.delete(WorkspaceTable).where(eq(WorkspaceTable.project_id, projectId))
    console.log(chalk.gray(`    Deleted ${workspaces.length} workspaces`))
  }
  
  // Delete project
  await db.delete(ProjectTable).where(eq(ProjectTable.id, projectId))
  console.log(chalk.gray(`    Deleted project: ${projectId}`))

  console.log(chalk.green(`✓ Project "${projectId}" and all associated data have been removed.`))
  return true
}

export async function removeProject(projectIds: string[]) {
  let successCount = 0
  let failCount = 0

  for (const projectId of projectIds) {
    console.log(chalk.bold(`\nRemoving project: ${projectId}`))
    const success = await removeSingleProject(projectId)
    if (success) {
      successCount++
    } else {
      failCount++
    }
  }

  if (projectIds.length > 1) {
    console.log(chalk.bold(`\nSummary: ${successCount} project(s) removed, ${failCount} failed`))
  }

  if (failCount > 0) {
    process.exit(1)
  }
}
