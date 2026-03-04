import { z } from "zod"
import { xdgData } from "xdg-basedir"
import { join } from "path"
import { existsSync, statSync } from "fs"

const envSchema = z.object({
  OPENCODE_DATA_PATH: z.string().optional(),
})

const env = envSchema.parse(process.env)

let cliDataPath: string | undefined

export function setDataPath(path: string | undefined) {
  cliDataPath = path
}

function resolveDatabasePath(path: string): string {
  if (existsSync(path)) {
    const stat = statSync(path)
    if (stat.isDirectory()) {
      return join(path, "opencode.db")
    }
    return path
  }
  
  const ext = path.split('.').pop()
  if (!ext || ext === path) {
    throw new Error(`Directory does not exist: ${path}`)
  }
  
  return path
}

export const config = {
  get databasePath(): string {
    if (cliDataPath) {
      return resolveDatabasePath(cliDataPath)
    }
    if (env.OPENCODE_DATA_PATH) {
      return resolveDatabasePath(env.OPENCODE_DATA_PATH)
    }
    return join(xdgData!, "opencode", "opencode.db")
  },
}
