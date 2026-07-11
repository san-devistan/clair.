import type { DataSource } from "./data-source"

export const DEMO_FEC_FILE_NAME = "demo-clair.txt"

export function isDemoDataSource(source: DataSource | null | undefined) {
  return source?.parseResult.meta.fileName === DEMO_FEC_FILE_NAME
}
