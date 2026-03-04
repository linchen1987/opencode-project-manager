#!/usr/bin/env node
import "dotenv/config"
import { Command } from "commander"
import { listProjects } from "./src/commands/list"
import { removeProject } from "./src/commands/remove"
import { setDataPath, config } from "./src/config"

const program = new Command()

program
  .name("opencode-project")
  .description("OpenCode Project Manager CLI")
  .version("1.0.0")
  .option("-d, --data-path <path>", "Path to opencode data directory or database file")
  .option("-v, --verbose", "Enable verbose output")
  .hook("preAction", (thisCommand) => {
    const options = thisCommand.opts()
    if (options.dataPath) {
      setDataPath(options.dataPath)
    }
    if (options.verbose) {
      console.log(`Data path: ${config.databasePath}`)
    }
  })

program
  .command("list")
  .alias("ls")
  .description("List all projects")
  .action(async () => {
    await listProjects()
  })

program
  .command("remove <ids...>")
  .alias("rm")
  .alias("delete")
  .alias("del")
  .description("Remove one or more projects and all associated data")
  .action(async (ids: string[]) => {
    await removeProject(ids)
  })

program.parse()
