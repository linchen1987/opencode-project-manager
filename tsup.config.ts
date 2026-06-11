import { defineConfig } from "tsup"
import pkg from "./package.json"

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  define: {
    PKG_VERSION: JSON.stringify(pkg.version),
  },
})
