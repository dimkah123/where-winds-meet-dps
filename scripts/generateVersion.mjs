import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"))

const buildInfo = {
  version: packageJson.version,
  buildTime: Date.now(),
}

// 1. Write public/version.json
writeFileSync(
  join(repoRoot, "public", "version.json"),
  JSON.stringify(buildInfo, null, 2) + "\n",
  "utf8",
)

// 2. Write src/buildInfo.ts
const tsContent = `// Automatically generated during build. Do not edit manually.
export interface BuildInfo {
  version: string
  buildTime: number
}

export const BUILD_INFO: BuildInfo = ${JSON.stringify(buildInfo, null, 2)}
`

writeFileSync(join(repoRoot, "src", "buildInfo.ts"), tsContent, "utf8")
console.log(
  `Generated build info for v${buildInfo.version} (${new Date(buildInfo.buildTime).toISOString()})`,
)
