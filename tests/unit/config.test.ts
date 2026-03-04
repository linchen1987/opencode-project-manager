import { describe, test, expect, beforeEach, afterEach } from "vitest"
import { setDataPath, config } from "../../src/config"
import { join } from "path"
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs"
import { tmpdir } from "os"

describe("Config", () => {
  let tempDir: string
  
  beforeEach(() => {
    tempDir = join(tmpdir(), `config-test-${Date.now()}`)
    mkdirSync(tempDir, { recursive: true })
    setDataPath(undefined)
  })
  
  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }
    setDataPath(undefined)
  })
  
  describe("setDataPath", () => {
    test("should accept directory path with database file", () => {
      const dbFile = join(tempDir, "opencode.db")
      writeFileSync(dbFile, "")
      
      setDataPath(dbFile)
      expect(config.databasePath).toBe(dbFile)
    })
    
    test("should accept directory path and append database filename", () => {
      const dirPath = tempDir
      setDataPath(dirPath)
      expect(config.databasePath).toBe(join(dirPath, "opencode.db"))
    })
    
    test("should throw error for non-existent directory", () => {
      const nonExistentDir = join(tempDir, "non-existent")
      setDataPath(nonExistentDir)
      
      expect(() => config.databasePath).toThrow("Directory does not exist")
    })
  })
})
