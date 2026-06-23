import { generateDemoEntries } from "./demo-generator"
import { dateStr, fr } from "./demo-utils"

export { generateDemoEntries }

const FEC_HEADERS = [
  "JournalCode",
  "JournalLib",
  "EcritureNum",
  "EcritureDate",
  "CompteNum",
  "CompteLib",
  "CompAuxNum",
  "CompAuxLib",
  "PieceRef",
  "PieceDate",
  "EcritureLib",
  "Debit",
  "Credit",
  "EcritureLet",
  "DateLet",
  "ValidDate",
  "Montantdevise",
  "Idevise",
]

export function generateDemoFecText(): string {
  const rows: string[] = [FEC_HEADERS.join("\t")]
  const entries = generateDemoEntries()
  for (const entry of entries) rows.push(formatFecRow(entry))
  return rows.join("\n")
}

function formatFecRow(entry: ReturnType<typeof generateDemoEntries>[number]) {
  return [
    entry.journalCode,
    entry.journalLib,
    entry.ecritureNum,
    dateStr(entry.ecritureDate),
    entry.compteNum,
    entry.compteLib,
    entry.compAuxNum,
    entry.compAuxLib,
    entry.pieceRef,
    dateStr(entry.pieceDate),
    entry.ecritureLib,
    fr(entry.debit),
    fr(entry.credit),
    "",
    "",
    dateStr(entry.ecritureDate),
    "",
    "EUR",
  ].join("\t")
}
