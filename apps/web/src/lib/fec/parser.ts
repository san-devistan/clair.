import {
  FecParseException,
  type FecEntry,
  type FecParseError,
  type FecParseResult,
} from "./types"

const REQUIRED_COLUMNS = [
  "JournalCode",
  "JournalLib",
  "EcritureNum",
  "EcritureDate",
  "CompteNum",
  "CompteLib",
  "EcritureLib",
] as const

const KNOWN_COLUMNS = [
  ...REQUIRED_COLUMNS,
  "CompAuxNum",
  "CompAuxLib",
  "PieceRef",
  "PieceDate",
  "Debit",
  "Credit",
  "EcritureLet",
  "DateLet",
  "ValidDate",
  "Montantdevise",
  "Idevise",
] as const

type FecSeparator = "\t" | ";" | "|" | ","
type FecColumn = (typeof KNOWN_COLUMNS)[number]

interface FecColumnIndex {
  journalCode: number
  journalLib: number
  ecritureNum: number
  ecritureDate: number
  compteNum: number
  compteLib: number
  compAuxNum: number
  compAuxLib: number
  pieceRef: number
  pieceDate: number
  ecritureLib: number
  debit: number
  credit: number
  ecritureLet: number
  dateLet: number
  validDate: number
  montantDevise: number
  idevise: number
}

interface ParsedEntries {
  entries: FecEntry[]
  minDate: Date | null
  maxDate: Date | null
}

function detectSeparator(headerLine: string): FecSeparator {
  // Format normatif FEC : tabulation ou pipe ; on accepte aussi point-virgule.
  const candidates: Array<{ sep: FecSeparator; count: number }> = [
    { sep: "\t", count: (headerLine.match(/\t/g) ?? []).length },
    { sep: "|", count: (headerLine.match(/\|/g) ?? []).length },
    { sep: ";", count: (headerLine.match(/;/g) ?? []).length },
    { sep: ",", count: (headerLine.match(/,/g) ?? []).length },
  ]
  candidates.sort((a, b) => b.count - a.count)
  return candidates[0].count > 0 ? candidates[0].sep : "\t"
}

async function decodeFile(
  file: File
): Promise<{ text: string; encoding: string }> {
  const buffer = await file.arrayBuffer()
  // Beaucoup de FEC sont encodes en ISO-8859-15 (latin-9) ou Windows-1252.
  // On essaie UTF-8 d'abord, on retombe sur Windows-1252 si on detecte des caracteres de remplacement.
  const utf8Decoder = new TextDecoder("utf-8", { fatal: false })
  const utf8 = utf8Decoder.decode(buffer)
  if (!utf8.includes("\uFFFD")) {
    return { text: utf8, encoding: "utf-8" }
  }
  const latinDecoder = new TextDecoder("windows-1252")
  const latin = latinDecoder.decode(buffer)
  return { text: latin, encoding: "windows-1252" }
}

function parseFrenchNumber(input: string): number {
  if (!input) return 0
  const normalized = input.trim().replace(/\s/g, "").replace(",", ".")
  if (normalized === "" || normalized === "-") return 0
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseFecDate(input: string): Date | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (/^\d{8}$/.test(trimmed)) {
    const year = Number(trimmed.slice(0, 4))
    const month = Number(trimmed.slice(4, 6)) - 1
    const day = Number(trimmed.slice(6, 8))
    const date = new Date(Date.UTC(year, month, day))
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const date = new Date(trimmed)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed)
  if (slash) {
    const day = Number(slash[1])
    const month = Number(slash[2]) - 1
    const year = Number(slash[3])
    const date = new Date(Date.UTC(year, month, day))
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

function splitLine(line: string, separator: FecSeparator): string[] {
  return line.split(separator)
}

function buildHeaderIndex(rawHeaders: string[]): Map<string, number> {
  const headerIndex = new Map<string, number>()
  rawHeaders.forEach((h, i) => {
    const normalized = h.replace(/\s/g, "")
    headerIndex.set(normalized.toLowerCase(), i)
  })
  return headerIndex
}

function colIndex(headerIndex: Map<string, number>, name: FecColumn): number {
  return headerIndex.get(name.toLowerCase()) ?? -1
}

function missingRequiredColumns(headerIndex: Map<string, number>): string[] {
  return REQUIRED_COLUMNS.filter(
    (column) => colIndex(headerIndex, column) === -1
  )
}

function buildColumnIndex(headerIndex: Map<string, number>): FecColumnIndex {
  return {
    journalCode: colIndex(headerIndex, "JournalCode"),
    journalLib: colIndex(headerIndex, "JournalLib"),
    ecritureNum: colIndex(headerIndex, "EcritureNum"),
    ecritureDate: colIndex(headerIndex, "EcritureDate"),
    compteNum: colIndex(headerIndex, "CompteNum"),
    compteLib: colIndex(headerIndex, "CompteLib"),
    compAuxNum: colIndex(headerIndex, "CompAuxNum"),
    compAuxLib: colIndex(headerIndex, "CompAuxLib"),
    pieceRef: colIndex(headerIndex, "PieceRef"),
    pieceDate: colIndex(headerIndex, "PieceDate"),
    ecritureLib: colIndex(headerIndex, "EcritureLib"),
    debit: colIndex(headerIndex, "Debit"),
    credit: colIndex(headerIndex, "Credit"),
    ecritureLet: colIndex(headerIndex, "EcritureLet"),
    dateLet: colIndex(headerIndex, "DateLet"),
    validDate: colIndex(headerIndex, "ValidDate"),
    montantDevise: colIndex(headerIndex, "Montantdevise"),
    idevise: colIndex(headerIndex, "Idevise"),
  }
}

export async function parseFecFile(file: File): Promise<FecParseResult> {
  const errors: FecParseError[] = []
  const warnings: string[] = []

  const { text, encoding } = await decodeFile(file)
  const normalizedText = text.replace(/\r\n?/g, "\n")
  const lines = normalizedText.split("\n").filter((l) => l.length > 0)

  if (lines.length < 2) {
    throw new FecParseException([
      {
        message:
          "Le fichier FEC semble vide. Verifiez qu'il contient au moins l'en-tete et une ecriture.",
      },
    ])
  }

  const separator = detectSeparator(lines[0])
  const rawHeaders = splitLine(lines[0], separator).map((h) => h.trim())
  const headerIndex = buildHeaderIndex(rawHeaders)

  const missingRequired = missingRequiredColumns(headerIndex)
  if (missingRequired.length > 0) {
    throw new FecParseException([
      {
        message: `Colonnes manquantes dans le FEC : ${missingRequired.join(", ")}.`,
      },
    ])
  }

  const idx = buildColumnIndex(headerIndex)
  const { entries, minDate, maxDate } = parseEntries(
    lines,
    separator,
    idx,
    errors
  )

  if (entries.length === 0) {
    throw new FecParseException(
      errors.length > 0
        ? errors
        : [
            {
              message:
                "Aucune ecriture exploitable n'a ete trouvee dans le fichier.",
            },
          ]
    )
  }

  if (errors.length > 0) {
    warnings.push(
      `${String(errors.length)} ligne(s) ignoree(s) en raison de dates invalides ou de format incorrect.`
    )
  }

  return {
    entries,
    warnings,
    meta: {
      fileName: file.name,
      fileSizeBytes: file.size,
      encoding,
      separator,
      rowCount: entries.length,
      parsedAt: Date.now(),
      minDate,
      maxDate,
    },
  }
}

function parseEntries(
  lines: string[],
  separator: FecSeparator,
  idx: FecColumnIndex,
  errors: FecParseError[]
): ParsedEntries {
  const entries: FecEntry[] = []
  let minDate: Date | null = null
  let maxDate: Date | null = null

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const entry = parseEntry(line, i + 1, separator, idx, errors)
    if (!entry) continue

    entries.push(entry)
    minDate = earlierDate(minDate, entry.ecritureDate)
    maxDate = laterDate(maxDate, entry.ecritureDate)
  }

  return { entries, minDate, maxDate }
}

function parseEntry(
  line: string,
  lineNumber: number,
  separator: FecSeparator,
  idx: FecColumnIndex,
  errors: FecParseError[]
): FecEntry | null {
  const cells = splitLine(line, separator)
  const get = (col: number): string =>
    col >= 0 && col < cells.length ? cells[col].trim() : ""
  const ecritureDate = parseFecDate(get(idx.ecritureDate))

  if (!ecritureDate) {
    errors.push({
      message: `Date d'ecriture invalide ligne ${String(lineNumber)}.`,
      line: lineNumber,
      raw: line,
    })
    return null
  }

  return {
    journalCode: get(idx.journalCode),
    journalLib: get(idx.journalLib),
    ecritureNum: get(idx.ecritureNum),
    ecritureDate,
    ecritureLib: get(idx.ecritureLib),
    compteNum: get(idx.compteNum),
    compteLib: get(idx.compteLib),
    compAuxNum: get(idx.compAuxNum),
    compAuxLib: get(idx.compAuxLib),
    pieceRef: get(idx.pieceRef),
    pieceDate: parseFecDate(get(idx.pieceDate)),
    debit: parseFrenchNumber(get(idx.debit)),
    credit: parseFrenchNumber(get(idx.credit)),
    ecritureLet: get(idx.ecritureLet),
    dateLet: parseFecDate(get(idx.dateLet)),
    validDate: parseFecDate(get(idx.validDate)),
    montantDevise: parseOptionalNumber(get, idx.montantDevise),
    idevise: get(idx.idevise),
  }
}

function parseOptionalNumber(
  get: (col: number) => string,
  column: number
): number | null {
  return column >= 0 ? parseFrenchNumber(get(column)) : null
}

function earlierDate(current: Date | null, next: Date): Date {
  return !current || next < current ? next : current
}

function laterDate(current: Date | null, next: Date): Date {
  return !current || next > current ? next : current
}
