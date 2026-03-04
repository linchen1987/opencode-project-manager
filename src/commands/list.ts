import { db } from "../db"
import { ProjectTable, SessionTable, MessageTable, PartTable, TodoTable, PermissionTable, WorkspaceTable } from "../storage/schema"
import { desc, count, eq } from "drizzle-orm"
import chalk from "chalk"
import Table from "cli-table3"
import { config } from "../config"
import { dirname, join } from "path"
import { existsSync } from "fs"

function formatTime(timestamp: number | null): string {
  if (!timestamp) return "-"
  const date = new Date(timestamp)
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export async function listProjects() {
  const projects = await db
    .select()
    .from(ProjectTable)
    .orderBy(desc(ProjectTable.time_updated))

  if (projects.length === 0) {
    console.log(chalk.yellow("No projects found."))
    return
  }

  const sessionCounts = await db
    .select({ project_id: SessionTable.project_id, count: count() })
    .from(SessionTable)
    .groupBy(SessionTable.project_id)

  const messageCounts = await db
    .select({ session_id: MessageTable.session_id, count: count() })
    .from(MessageTable)
    .groupBy(MessageTable.session_id)

  const partCounts = await db
    .select({ session_id: PartTable.session_id, count: count() })
    .from(PartTable)
    .groupBy(PartTable.session_id)

  const todoCounts = await db
    .select({ session_id: TodoTable.session_id, count: count() })
    .from(TodoTable)
    .groupBy(TodoTable.session_id)

  const workspaceCounts = await db
    .select({ project_id: WorkspaceTable.project_id, count: count() })
    .from(WorkspaceTable)
    .groupBy(WorkspaceTable.project_id)

  const permissionCounts = await db
    .select({ project_id: PermissionTable.project_id })
    .from(PermissionTable)

  const sessionMap = new Map(sessionCounts.map(s => [s.project_id, s.count]))
  const workspaceMap = new Map(workspaceCounts.map(w => [w.project_id, w.count]))
  const permissionSet = new Set(permissionCounts.map(p => p.project_id))

  const projectSessionIds = new Map<string, string[]>()
  for (const session of sessionCounts) {
    const sessions = projectSessionIds.get(session.project_id) || []
    const sessionIds = await db.select({ id: SessionTable.id }).from(SessionTable).where(eq(SessionTable.project_id, session.project_id))
    projectSessionIds.set(session.project_id, sessionIds.map(s => s.id))
  }

  const messageMap = new Map<string, number>()
  const partMap = new Map<string, number>()
  const todoMap = new Map<string, number>()

  for (const [projectId, sessionIds] of projectSessionIds) {
    let totalMessages = 0
    let totalParts = 0
    let totalTodos = 0
    
    for (const sessionId of sessionIds) {
      const msgCount = messageCounts.find(m => m.session_id === sessionId)?.count || 0
      const ptCount = partCounts.find(p => p.session_id === sessionId)?.count || 0
      const tdCount = todoCounts.find(t => t.session_id === sessionId)?.count || 0
      totalMessages += msgCount
      totalParts += ptCount
      totalTodos += tdCount
    }
    
    messageMap.set(projectId, totalMessages)
    partMap.set(projectId, totalParts)
    todoMap.set(projectId, totalTodos)
  }

  const dataDir = dirname(config.databasePath)
  const sessionDiffDir = join(dataDir, "storage", "session_diff")
  const snapshotBaseDir = join(dataDir, "snapshot")
  
  const sessionDiffMap = new Map<string, number>()
  for (const [projectId, sessionIds] of projectSessionIds) {
    let totalDiffs = 0
    for (const sessionId of sessionIds) {
      const sessionDiffFile = join(sessionDiffDir, `${sessionId}.json`)
      if (existsSync(sessionDiffFile)) {
        totalDiffs++
      }
    }
    sessionDiffMap.set(projectId, totalDiffs)
  }
  
  const snapshotMap = new Map<string, number>()
  for (const project of projects) {
    const snapshotDir = join(snapshotBaseDir, project.id)
    snapshotMap.set(project.id, existsSync(snapshotDir) ? 1 : 0)
  }

  const table = new Table({
    head: [
      chalk.white.bold("ID"),
      chalk.white.bold("Worktree"),
      chalk.white.bold("Sessions"),
      chalk.white.bold("Messages"),
      chalk.white.bold("Parts"),
      chalk.white.bold("Todos"),
      chalk.white.bold("Diffs"),
      chalk.white.bold("Snapshots"),
      chalk.white.bold("Updated"),
    ],
    colWidths: [42, 60, 10, 10, 10, 8, 8, 10, 20],
    style: {
      head: [],
      border: ["gray"],
    },
  })

  projects.forEach((project) => {
    table.push([
      chalk.cyan(project.id),
      project.worktree,
      chalk.green(sessionMap.get(project.id) || 0),
      chalk.green(messageMap.get(project.id) || 0),
      chalk.green(partMap.get(project.id) || 0),
      chalk.green(todoMap.get(project.id) || 0),
      chalk.green(sessionDiffMap.get(project.id) || 0),
      chalk.green(snapshotMap.get(project.id) || 0),
      chalk.green(formatTime(project.time_updated)),
    ])
  })

  console.log(table.toString())
  console.log(chalk.white(`\nTotal: ${projects.length} project(s)`))
}
