/* oxlint-disable eslint/complexity, eslint/max-lines */
// Generateur de FEC fictif pour la demo. Il simule une PME francaise saine,
// rentable et en croissance, avec assez de detail comptable pour alimenter
// toutes les vues du tableau de bord : revenus, charges, tresorerie, tiers,
// balance agee, bilan, ratios et insights.

interface DemoEntry {
  journalCode: string
  journalLib: string
  ecritureNum: string
  ecritureDate: Date
  compteNum: string
  compteLib: string
  compAuxNum: string
  compAuxLib: string
  pieceRef: string
  pieceDate: Date
  ecritureLib: string
  debit: number
  credit: number
}

interface AccountRef {
  compteNum: string
  compteLib: string
  compAuxNum?: string
  compAuxLib?: string
}

interface EntryBase {
  journalCode: string
  journalLib: string
  ecritureNum: string
  ecritureDate: Date
  pieceRef: string
  pieceDate: Date
  ecritureLib: string
}

interface EntryLine extends AccountRef {
  debit: number
  credit: number
}

interface Customer extends AccountRef {
  weight: number
  paymentDays: number
  hardwareBias: number
  projectBias: number
}

interface Supplier extends AccountRef {
  account: AccountRef
  amount:
    | {
        kind: "fixed"
        min: number
        max: number
        growth?: number
      }
    | {
        kind: "revenue-share"
        share: number
      }
  paymentDays: number
  vatRate: number
  activeMonths?: readonly number[]
}

interface RevenueLine {
  account: AccountRef
  share: number
}

interface CustomerInvoiceInput {
  entries: DemoEntry[]
  ecritureNum: string
  invoiceDate: Date
  customer: Customer
  amountHt: number
  ref: string
}

interface SupplierInvoiceInput {
  entries: DemoEntry[]
  ecritureNum: string
  invoiceDate: Date
  supplier: Supplier
  amountHt: number
  ref: string
}

interface PaymentInput {
  entries: DemoEntry[]
  ecritureNum: string
  paymentDate: Date
  account: AccountRef
  amount: number
  ref: string
  label: string
}

interface VatPaymentInput {
  entries: DemoEntry[]
  ecritureNum: string
  paymentDate: Date
  amount: number
  ref: string
}

interface PayrollInput {
  entries: DemoEntry[]
  nextNum: () => string
  monthDate: Date
  monthIndex: number
  endMonth: Date
}

interface TaxAccrualInput {
  entries: DemoEntry[]
  nextNum: () => string
  monthDate: Date
  monthlyTarget: number
  endMonth: Date
}

const DAY_MS = 86_400_000
const DEFAULT_VAT_RATE = 0.2
const OPENING_VAT_PAYABLE = 14_800

const BANK_OPERATING: AccountRef = {
  compteNum: "512001",
  compteLib: "Banque BNP - Compte exploitation",
}

const BANK_RESERVE: AccountRef = {
  compteNum: "512100",
  compteLib: "Banque BNP - Reserve de tresorerie",
}

const CASH_REGISTER: AccountRef = {
  compteNum: "530000",
  compteLib: "Caisse showroom",
}

const SALARY_PAYABLE: AccountRef = {
  compteNum: "421000",
  compteLib: "Personnel - remunerations dues",
}

const SOCIAL_URSSAF: AccountRef = {
  compteNum: "431000",
  compteLib: "URSSAF",
}

const SOCIAL_RETIREMENT: AccountRef = {
  compteNum: "437000",
  compteLib: "Caisses de retraite et prevoyance",
}

const VAT_COLLECTED: AccountRef = {
  compteNum: "445710",
  compteLib: "TVA collectee 20%",
}

const VAT_DEDUCTIBLE: AccountRef = {
  compteNum: "445660",
  compteLib: "TVA deductible 20%",
}

const LOAN_ACCOUNT: AccountRef = {
  compteNum: "164000",
  compteLib: "Emprunt bancaire moyen terme",
}

const TAX_PAYABLE: AccountRef = {
  compteNum: "448600",
  compteLib: "Etat - charges a payer",
}

const INCOME_TAX_PAYABLE: AccountRef = {
  compteNum: "444000",
  compteLib: "Etat - impot sur les benefices",
}

const CUSTOMERS: readonly Customer[] = [
  {
    compteNum: "411SOLR",
    compteLib: "SOLARIUS ENERGIE SAS",
    compAuxNum: "411SOLR",
    compAuxLib: "SOLARIUS ENERGIE SAS",
    weight: 0.18,
    paymentDays: 48,
    hardwareBias: 0.04,
    projectBias: 0.2,
  },
  {
    compteNum: "411COBL",
    compteLib: "COBALT RETAIL GROUP",
    compAuxNum: "411COBL",
    compAuxLib: "COBALT RETAIL GROUP",
    weight: 0.14,
    paymentDays: 34,
    hardwareBias: 0.06,
    projectBias: 0.18,
  },
  {
    compteNum: "411HELI",
    compteLib: "HELIO HABITAT",
    compAuxNum: "411HELI",
    compAuxLib: "HELIO HABITAT",
    weight: 0.12,
    paymentDays: 40,
    hardwareBias: 0.08,
    projectBias: 0.16,
  },
  {
    compteNum: "411NORD",
    compteLib: "NORDIK HOTELS",
    compAuxNum: "411NORD",
    compAuxLib: "NORDIK HOTELS",
    weight: 0.1,
    paymentDays: 30,
    hardwareBias: 0.02,
    projectBias: 0.23,
  },
  {
    compteNum: "411AERI",
    compteLib: "AERIS PHARMA",
    compAuxNum: "411AERI",
    compAuxLib: "AERIS PHARMA",
    weight: 0.09,
    paymentDays: 45,
    hardwareBias: 0.03,
    projectBias: 0.17,
  },
  {
    compteNum: "411URBN",
    compteLib: "URBAN CYCLE",
    compAuxNum: "411URBN",
    compAuxLib: "URBAN CYCLE",
    weight: 0.08,
    paymentDays: 28,
    hardwareBias: 0.09,
    projectBias: 0.12,
  },
  {
    compteNum: "411VALM",
    compteLib: "VALMONT INDUSTRIE",
    compAuxNum: "411VALM",
    compAuxLib: "VALMONT INDUSTRIE",
    weight: 0.08,
    paymentDays: 58,
    hardwareBias: 0.05,
    projectBias: 0.15,
  },
  {
    compteNum: "411BOTA",
    compteLib: "BOTANICA FRANCE",
    compAuxNum: "411BOTA",
    compAuxLib: "BOTANICA FRANCE",
    weight: 0.07,
    paymentDays: 25,
    hardwareBias: 0.0,
    projectBias: 0.2,
  },
  {
    compteNum: "411OCTA",
    compteLib: "OCTANT LOGISTICS",
    compAuxNum: "411OCTA",
    compAuxLib: "OCTANT LOGISTICS",
    weight: 0.06,
    paymentDays: 36,
    hardwareBias: 0.04,
    projectBias: 0.16,
  },
  {
    compteNum: "411RIVI",
    compteLib: "RIVIERA RESORTS",
    compAuxNum: "411RIVI",
    compAuxLib: "RIVIERA RESORTS",
    weight: 0.04,
    paymentDays: 32,
    hardwareBias: 0.06,
    projectBias: 0.22,
  },
  {
    compteNum: "411NANT",
    compteLib: "COMMUNE DE NANTES",
    compAuxNum: "411NANT",
    compAuxLib: "COMMUNE DE NANTES",
    weight: 0.03,
    paymentDays: 74,
    hardwareBias: 0.02,
    projectBias: 0.3,
  },
  {
    compteNum: "411POLL",
    compteLib: "ATELIER POLLEN",
    compAuxNum: "411POLL",
    compAuxLib: "ATELIER POLLEN",
    weight: 0.01,
    paymentDays: 20,
    hardwareBias: -0.03,
    projectBias: 0.18,
  },
]

const SUPPLIERS: readonly Supplier[] = [
  {
    compteNum: "401LUMC",
    compteLib: "LUMINA COMPONENTS GMBH",
    compAuxNum: "401LUMC",
    compAuxLib: "LUMINA COMPONENTS GMBH",
    account: { compteNum: "607100", compteLib: "Achats modules LED" },
    amount: { kind: "revenue-share", share: 0.145 },
    paymentDays: 44,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401FIEL",
    compteLib: "FIELD OPS PARTNERS",
    compAuxNum: "401FIEL",
    compAuxLib: "FIELD OPS PARTNERS",
    account: { compteNum: "611000", compteLib: "Sous-traitance installation" },
    amount: { kind: "revenue-share", share: 0.052 },
    paymentDays: 38,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401PACK",
    compteLib: "OCEAN PACKAGING",
    compAuxNum: "401PACK",
    compAuxLib: "OCEAN PACKAGING",
    account: { compteNum: "602200", compteLib: "Fournitures packaging" },
    amount: { kind: "revenue-share", share: 0.022 },
    paymentDays: 30,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401CHRO",
    compteLib: "CHRONOPOST PRO",
    compAuxNum: "401CHRO",
    compAuxLib: "CHRONOPOST PRO",
    account: { compteNum: "624100", compteLib: "Transport sur ventes" },
    amount: { kind: "revenue-share", share: 0.017 },
    paymentDays: 28,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401AWS",
    compteLib: "AMAZON WEB SERVICES EMEA",
    compAuxNum: "401AWS",
    compAuxLib: "AMAZON WEB SERVICES EMEA",
    account: { compteNum: "613500", compteLib: "Hebergement cloud" },
    amount: { kind: "fixed", min: 3_000, max: 5_600, growth: 0.035 },
    paymentDays: 30,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401COWO",
    compteLib: "WEWORK FRANCE SAS",
    compAuxNum: "401COWO",
    compAuxLib: "WEWORK FRANCE SAS",
    account: { compteNum: "613200", compteLib: "Loyer showroom et bureaux" },
    amount: { kind: "fixed", min: 5_900, max: 6_250 },
    paymentDays: 8,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401STACK",
    compteLib: "STACK OPERATIONS",
    compAuxNum: "401STACK",
    compAuxLib: "STACK OPERATIONS",
    account: { compteNum: "628100", compteLib: "Abonnements logiciels" },
    amount: { kind: "fixed", min: 1_450, max: 2_200, growth: 0.012 },
    paymentDays: 22,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401EDF",
    compteLib: "EDF ENTREPRISES",
    compAuxNum: "401EDF",
    compAuxLib: "EDF ENTREPRISES",
    account: { compteNum: "606100", compteLib: "Energie showroom" },
    amount: { kind: "fixed", min: 420, max: 860 },
    paymentDays: 20,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401AXA",
    compteLib: "AXA FRANCE IARD",
    compAuxNum: "401AXA",
    compAuxLib: "AXA FRANCE IARD",
    account: { compteNum: "616000", compteLib: "Assurance RC pro" },
    amount: { kind: "fixed", min: 1_180, max: 1_360 },
    paymentDays: 18,
    vatRate: 0,
    activeMonths: [0, 3, 6, 9],
  },
  {
    compteNum: "401MART",
    compteLib: "CABINET MARTIN EXPERTISE",
    compAuxNum: "401MART",
    compAuxLib: "CABINET MARTIN EXPERTISE",
    account: { compteNum: "622600", compteLib: "Honoraires comptables" },
    amount: { kind: "fixed", min: 1_250, max: 1_600 },
    paymentDays: 25,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401ADS",
    compteLib: "BRIGHTADS ACQUISITION",
    compAuxNum: "401ADS",
    compAuxLib: "BRIGHTADS ACQUISITION",
    account: { compteNum: "623000", compteLib: "Campagnes acquisition" },
    amount: { kind: "fixed", min: 2_800, max: 7_500, growth: 0.025 },
    paymentDays: 35,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401GROW",
    compteLib: "GROWTH PARTNER STUDIO",
    compAuxNum: "401GROW",
    compAuxLib: "GROWTH PARTNER STUDIO",
    account: { compteNum: "622200", compteLib: "Commissions commerciales" },
    amount: { kind: "fixed", min: 1_500, max: 3_800, growth: 0.018 },
    paymentDays: 32,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401TRAV",
    compteLib: "TRAINLINE BUSINESS",
    compAuxNum: "401TRAV",
    compAuxLib: "TRAINLINE BUSINESS",
    account: { compteNum: "625100", compteLib: "Deplacements equipe" },
    amount: { kind: "fixed", min: 550, max: 1_900 },
    paymentDays: 15,
    vatRate: DEFAULT_VAT_RATE,
  },
  {
    compteNum: "401BNP",
    compteLib: "BNP PARIBAS",
    compAuxNum: "401BNP",
    compAuxLib: "BNP PARIBAS",
    account: { compteNum: "627800", compteLib: "Frais bancaires" },
    amount: { kind: "fixed", min: 360, max: 690 },
    paymentDays: 5,
    vatRate: 0,
  },
]

const EQUIPMENT_SUPPLIER: AccountRef = {
  compteNum: "401EQUI",
  compteLib: "EQUINOX EQUIPEMENT",
  compAuxNum: "401EQUI",
  compAuxLib: "EQUINOX EQUIPEMENT",
}

const OPENING_RECEIVABLES: ReadonlyArray<{
  customer: Customer
  amount: number
  ref: string
}> = [
  { customer: CUSTOMERS[0], amount: 28_400, ref: "AN-CLI-SOLR" },
  { customer: CUSTOMERS[2], amount: 16_900, ref: "AN-CLI-HELI" },
]

const OPENING_PAYABLES: ReadonlyArray<{
  supplier: AccountRef
  amount: number
  ref: string
}> = [
  { supplier: SUPPLIERS[0], amount: 15_600, ref: "AN-FOU-LUMC" },
  { supplier: SUPPLIERS[5], amount: 4_800, ref: "AN-FOU-COWO" },
]

const AGED_RECEIVABLES: ReadonlyArray<{
  customer: Customer
  invoiceDaysOpen: number
  amountHt: number
  ref: string
}> = [
  {
    customer: {
      compteNum: "411ORIG",
      compteLib: "ORIGIN CARE",
      compAuxNum: "411ORIG",
      compAuxLib: "ORIGIN CARE",
      weight: 0,
      paymentDays: 30,
      hardwareBias: 0.02,
      projectBias: 0.18,
    },
    invoiceDaysOpen: 74,
    amountHt: 24_800,
    ref: "RET-CLI-31-60",
  },
  {
    customer: {
      compteNum: "411MONT",
      compteLib: "MONTCLAIR MOBILITES",
      compAuxNum: "411MONT",
      compAuxLib: "MONTCLAIR MOBILITES",
      weight: 0,
      paymentDays: 30,
      hardwareBias: 0.04,
      projectBias: 0.21,
    },
    invoiceDaysOpen: 108,
    amountHt: 19_600,
    ref: "RET-CLI-60-90",
  },
]

const AGED_PAYABLES: ReadonlyArray<{
  supplier: Supplier
  invoiceDaysOpen: number
  amountHt: number
  ref: string
}> = [
  {
    supplier: {
      compteNum: "401SENS",
      compteLib: "SENSORIAL COMPONENTS",
      compAuxNum: "401SENS",
      compAuxLib: "SENSORIAL COMPONENTS",
      account: { compteNum: "607100", compteLib: "Achats modules LED" },
      amount: { kind: "fixed", min: 0, max: 0 },
      paymentDays: 30,
      vatRate: DEFAULT_VAT_RATE,
    },
    invoiceDaysOpen: 76,
    amountHt: 13_900,
    ref: "RET-FOU-31-60",
  },
  {
    supplier: {
      compteNum: "401ATLA",
      compteLib: "ATLAS INSTALLATION",
      compAuxNum: "401ATLA",
      compAuxLib: "ATLAS INSTALLATION",
      account: {
        compteNum: "611000",
        compteLib: "Sous-traitance installation",
      },
      amount: { kind: "fixed", min: 0, max: 0 },
      paymentDays: 30,
      vatRate: DEFAULT_VAT_RATE,
    },
    invoiceDaysOpen: 112,
    amountHt: 10_700,
    ref: "RET-FOU-60-90",
  },
]

function dateStr(d: Date): string {
  const y = String(d.getUTCFullYear())
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}${m}${day}`
}

function fr(value: number): string {
  return roundMoney(value).toFixed(2).replace(".", ",")
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function pseudoRandom(seed: number): () => number {
  // PRNG deterministe (mulberry32) pour avoir des donnees stables entre rendus.
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

function monthDay(monthDate: Date, day: number): Date {
  const end = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)
  )
  return new Date(
    Date.UTC(
      monthDate.getUTCFullYear(),
      monthDate.getUTCMonth(),
      Math.min(day, end.getUTCDate())
    )
  )
}

function addLines(
  entries: DemoEntry[],
  base: EntryBase,
  lines: readonly EntryLine[]
) {
  for (const item of lines) {
    entries.push({
      ...base,
      compteNum: item.compteNum,
      compteLib: item.compteLib,
      compAuxNum: item.compAuxNum ?? "",
      compAuxLib: item.compAuxLib ?? "",
      debit: roundMoney(item.debit),
      credit: roundMoney(item.credit),
    })
  }
}

function entryLine(
  account: AccountRef,
  debit: number,
  credit: number
): EntryLine {
  return {
    ...account,
    debit,
    credit,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function splitByShares(total: number, shares: readonly number[]): number[] {
  const amounts: number[] = []
  let allocated = 0
  for (let index = 0; index < shares.length; index++) {
    if (index === shares.length - 1) {
      amounts.push(roundMoney(total - allocated))
      break
    }
    const amount = roundMoney(total * shares[index])
    amounts.push(amount)
    allocated += amount
  }
  return amounts
}

function monthKey(date: Date): string {
  return `${String(date.getUTCFullYear()).slice(2)}${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}`
}

function computeMonthlyRevenueTarget(monthIndex: number, monthDate: Date) {
  const base = 88_000
  const growth = Math.pow(1.045, monthIndex)
  const month = monthDate.getUTCMonth()
  const summer = month === 6 ? 0.9 : month === 7 ? 0.84 : 1
  const december = month === 11 ? 1.12 : 1
  const launch =
    monthIndex >= 11
      ? 1.22
      : monthIndex === 10
        ? 1.18
        : monthIndex === 9
          ? 1.12
          : 1
  return roundMoney(base * growth * summer * december * launch)
}

function revenueLinesForCustomer(customer: Customer): RevenueLine[] {
  const hardwareShare = clamp(0.2 + customer.hardwareBias, 0.12, 0.32)
  const projectShare = clamp(customer.projectBias, 0.12, 0.3)
  const transportShare = hardwareShare > 0.22 ? 0.035 : 0.02
  const supportShare = 0.055
  const subscriptionShare =
    1 - hardwareShare - projectShare - transportShare - supportShare

  return [
    {
      account: {
        compteNum: "706100",
        compteLib: "Abonnements plateforme ClairView",
      },
      share: subscriptionShare,
    },
    {
      account: {
        compteNum: "704000",
        compteLib: "Etudes et installations",
      },
      share: projectShare,
    },
    {
      account: {
        compteNum: "707100",
        compteLib: "Vente kits capteurs lumineux",
      },
      share: hardwareShare,
    },
    {
      account: {
        compteNum: "708500",
        compteLib: "Ports et frais accessoires factures",
      },
      share: transportShare,
    },
    {
      account: {
        compteNum: "708800",
        compteLib: "Support premium et formations",
      },
      share: supportShare,
    },
  ]
}

function supplierAmount(
  supplier: Supplier,
  monthlyTarget: number,
  monthIndex: number,
  random: () => number
): number {
  if (
    supplier.activeMonths &&
    !supplier.activeMonths.includes(monthIndex % 12)
  ) {
    return 0
  }

  if (supplier.amount.kind === "revenue-share") {
    const noise = 0.92 + random() * 0.18
    return roundMoney(monthlyTarget * supplier.amount.share * noise)
  }

  const noise = 0.92 + random() * 0.16
  const base =
    supplier.amount.min + (supplier.amount.max - supplier.amount.min) * random()
  const growth = 1 + (supplier.amount.growth ?? 0) * monthIndex
  return roundMoney(base * noise * growth)
}

function addOpeningEntries(
  entries: DemoEntry[],
  ecritureNum: string,
  startMonth: Date
) {
  addLines(
    entries,
    {
      journalCode: "AN",
      journalLib: "A-Nouveaux",
      ecritureNum,
      ecritureDate: startMonth,
      pieceRef: "AN-OUV",
      pieceDate: startMonth,
      ecritureLib: "Reprise des soldes d'ouverture",
    },
    [
      entryLine(BANK_OPERATING, 96_000, 0),
      entryLine(BANK_RESERVE, 42_000, 0),
      entryLine(CASH_REGISTER, 1_200, 0),
      entryLine(
        {
          compteNum: "218300",
          compteLib: "Materiel showroom et bancs de test",
        },
        86_000,
        0
      ),
      entryLine(
        {
          compteNum: "281830",
          compteLib: "Amortissements materiel industriel",
        },
        0,
        18_500
      ),
      entryLine(
        { compteNum: "371000", compteLib: "Stock kits connectes" },
        48_000,
        0
      ),
      ...OPENING_RECEIVABLES.map(({ customer, amount }) =>
        entryLine(customer, amount, 0)
      ),
      entryLine(
        { compteNum: "486000", compteLib: "Charges constatees d'avance" },
        7_800,
        0
      ),
      ...OPENING_PAYABLES.map(({ supplier, amount }) =>
        entryLine(supplier, 0, amount)
      ),
      entryLine(VAT_COLLECTED, 0, OPENING_VAT_PAYABLE),
      entryLine(SOCIAL_URSSAF, 0, 9_500),
      entryLine(LOAN_ACCOUNT, 0, 58_000),
      entryLine(
        { compteNum: "101000", compteLib: "Capital social" },
        0,
        80_000
      ),
      entryLine(
        { compteNum: "106100", compteLib: "Reserve legale" },
        0,
        72_000
      ),
      entryLine(
        { compteNum: "110000", compteLib: "Report a nouveau crediteur" },
        0,
        53_100
      ),
    ]
  )
}

function addOpeningPayments(
  entries: DemoEntry[],
  nextNum: () => string,
  startMonth: Date
) {
  for (const [
    index,
    { customer, amount, ref },
  ] of OPENING_RECEIVABLES.entries())
    addCustomerPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate: addDays(startMonth, 14 + index * 9),
      account: customer,
      amount,
      ref,
      label: `Encaissement solde d'ouverture ${customer.compteLib}`,
    })

  for (const [index, { supplier, amount, ref }] of OPENING_PAYABLES.entries())
    addSupplierPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate: addDays(startMonth, 6 + index * 5),
      account: supplier,
      amount,
      ref,
      label: `Reglement solde d'ouverture ${supplier.compteLib}`,
    })

  addLiabilityPayment({
    entries,
    ecritureNum: nextNum(),
    paymentDate: addDays(startMonth, 13),
    account: SOCIAL_URSSAF,
    amount: 9_500,
    ref: "AN-SOC",
    label: "Reglement charges sociales d'ouverture",
  })
}

function addCustomerInvoice({
  entries,
  ecritureNum,
  invoiceDate,
  customer,
  amountHt,
  ref,
}: CustomerInvoiceInput): number {
  const revenueLines = revenueLinesForCustomer(customer)
  const amounts = splitByShares(
    amountHt,
    revenueLines.map((item) => item.share)
  )
  const tva = roundMoney(amountHt * DEFAULT_VAT_RATE)
  const amountTtc = roundMoney(amountHt + tva)

  addLines(
    entries,
    {
      journalCode: "VE",
      journalLib: "Ventes",
      ecritureNum,
      ecritureDate: invoiceDate,
      pieceRef: ref,
      pieceDate: invoiceDate,
      ecritureLib: `Facture ${customer.compteLib}`,
    },
    [
      entryLine(customer, amountTtc, 0),
      ...revenueLines.map((item, index) =>
        entryLine(item.account, 0, amounts[index])
      ),
      entryLine(VAT_COLLECTED, 0, tva),
    ]
  )

  return amountTtc
}

function addCustomerPayment({
  entries,
  ecritureNum,
  paymentDate,
  account,
  amount,
  ref,
  label,
}: PaymentInput) {
  addLines(
    entries,
    {
      journalCode: "BQ",
      journalLib: "Banque",
      ecritureNum,
      ecritureDate: paymentDate,
      pieceRef: ref,
      pieceDate: paymentDate,
      ecritureLib: label,
    },
    [entryLine(BANK_OPERATING, amount, 0), entryLine(account, 0, amount)]
  )
}

function addSupplierInvoice({
  entries,
  ecritureNum,
  invoiceDate,
  supplier,
  amountHt,
  ref,
}: SupplierInvoiceInput): number {
  const tva = roundMoney(amountHt * supplier.vatRate)
  const amountTtc = roundMoney(amountHt + tva)
  const vatLine =
    tva > 0 ? [entryLine(VAT_DEDUCTIBLE, tva, 0)] : ([] as EntryLine[])

  addLines(
    entries,
    {
      journalCode: "AC",
      journalLib: "Achats",
      ecritureNum,
      ecritureDate: invoiceDate,
      pieceRef: ref,
      pieceDate: invoiceDate,
      ecritureLib: supplier.account.compteLib,
    },
    [
      entryLine(supplier.account, amountHt, 0),
      ...vatLine,
      entryLine(supplier, 0, amountTtc),
    ]
  )

  return amountTtc
}

function addSupplierPayment({
  entries,
  ecritureNum,
  paymentDate,
  account,
  amount,
  ref,
  label,
}: PaymentInput) {
  addLines(
    entries,
    {
      journalCode: "BQ",
      journalLib: "Banque",
      ecritureNum,
      ecritureDate: paymentDate,
      pieceRef: ref,
      pieceDate: paymentDate,
      ecritureLib: label,
    },
    [entryLine(account, amount, 0), entryLine(BANK_OPERATING, 0, amount)]
  )
}

function addLiabilityPayment({
  entries,
  ecritureNum,
  paymentDate,
  account,
  amount,
  ref,
  label,
}: PaymentInput) {
  addLines(
    entries,
    {
      journalCode: "BQ",
      journalLib: "Banque",
      ecritureNum,
      ecritureDate: paymentDate,
      pieceRef: ref,
      pieceDate: paymentDate,
      ecritureLib: label,
    },
    [entryLine(account, amount, 0), entryLine(BANK_OPERATING, 0, amount)]
  )
}

function addVatPayment({
  entries,
  ecritureNum,
  paymentDate,
  amount,
  ref,
}: VatPaymentInput) {
  addLines(
    entries,
    {
      journalCode: "BQ",
      journalLib: "Banque",
      ecritureNum,
      ecritureDate: paymentDate,
      pieceRef: ref,
      pieceDate: paymentDate,
      ecritureLib: "Reglement TVA",
    },
    [entryLine(VAT_COLLECTED, amount, 0), entryLine(BANK_OPERATING, 0, amount)]
  )
}

function addPayroll({
  entries,
  nextNum,
  monthDate,
  monthIndex,
  endMonth,
}: PayrollInput) {
  const payrollDate = monthDay(monthDate, 31)
  const gross = roundMoney(21_200 * (1 + 0.012 * monthIndex))
  const bonus = monthDate.getUTCMonth() === 11 ? 4_800 : 0
  const grossWithBonus = gross + bonus
  const urssaf = roundMoney(grossWithBonus * 0.34)
  const retirement = roundMoney(grossWithBonus * 0.075)
  const benefits = roundMoney(1_150 * (1 + 0.008 * monthIndex))
  const netSalary = roundMoney(grossWithBonus * 0.78)
  const urssafPayable = roundMoney(grossWithBonus * 0.22 + urssaf)
  const retirementPayable = roundMoney(retirement + benefits)
  const ref = `PAIE-${monthKey(monthDate)}`

  addLines(
    entries,
    {
      journalCode: "OD",
      journalLib: "Operations diverses",
      ecritureNum: nextNum(),
      ecritureDate: payrollDate,
      pieceRef: ref,
      pieceDate: payrollDate,
      ecritureLib: "Paie et charges sociales",
    },
    [
      entryLine(
        { compteNum: "641100", compteLib: "Salaires bruts" },
        grossWithBonus,
        0
      ),
      entryLine(
        { compteNum: "645100", compteLib: "Cotisations URSSAF" },
        urssaf,
        0
      ),
      entryLine(
        { compteNum: "645300", compteLib: "Retraite et prevoyance" },
        retirement,
        0
      ),
      entryLine(
        { compteNum: "647000", compteLib: "Mutuelle et avantages" },
        benefits,
        0
      ),
      entryLine(SALARY_PAYABLE, 0, netSalary),
      entryLine(SOCIAL_URSSAF, 0, urssafPayable),
      entryLine(SOCIAL_RETIREMENT, 0, retirementPayable),
    ]
  )

  const salaryPaymentDate = addDays(payrollDate, 4)
  if (salaryPaymentDate <= endMonth)
    addLiabilityPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate: salaryPaymentDate,
      account: SALARY_PAYABLE,
      amount: netSalary,
      ref,
      label: "Virement salaires",
    })

  const socialPaymentDate = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 15)
  )
  if (socialPaymentDate <= endMonth) {
    addLiabilityPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate: socialPaymentDate,
      account: SOCIAL_URSSAF,
      amount: urssafPayable,
      ref: `${ref}-URSSAF`,
      label: "Reglement URSSAF",
    })
    addLiabilityPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate: socialPaymentDate,
      account: SOCIAL_RETIREMENT,
      amount: retirementPayable,
      ref: `${ref}-RET`,
      label: "Reglement retraite et prevoyance",
    })
  }
}

function addTaxAccrual({
  entries,
  nextNum,
  monthDate,
  monthlyTarget,
  endMonth,
}: TaxAccrualInput) {
  if ((monthDate.getUTCMonth() + 1) % 3 !== 0) return

  const taxDate = monthDay(monthDate, 28)
  const amount = roundMoney(monthlyTarget * 0.008)
  const ref = `TAX-${monthKey(monthDate)}`
  addLines(
    entries,
    {
      journalCode: "OD",
      journalLib: "Operations diverses",
      ecritureNum: nextNum(),
      ecritureDate: taxDate,
      pieceRef: ref,
      pieceDate: taxDate,
      ecritureLib: "Provision taxes locales et formation",
    },
    [
      entryLine(
        { compteNum: "633300", compteLib: "Formation professionnelle" },
        amount,
        0
      ),
      entryLine(TAX_PAYABLE, 0, amount),
    ]
  )

  const paymentDate = addDays(taxDate, 24)
  if (paymentDate <= endMonth)
    addLiabilityPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate,
      account: TAX_PAYABLE,
      amount,
      ref,
      label: "Reglement taxes locales et formation",
    })
}

function addIncomeTaxProvision(
  entries: DemoEntry[],
  nextNum: () => string,
  monthDate: Date
) {
  const provisionDate = monthDay(monthDate, 30)
  addLines(
    entries,
    {
      journalCode: "OD",
      journalLib: "Operations diverses",
      ecritureNum: nextNum(),
      ecritureDate: provisionDate,
      pieceRef: `IS-${monthKey(monthDate)}`,
      pieceDate: provisionDate,
      ecritureLib: "Provision impot sur les societes",
    },
    [
      entryLine(
        { compteNum: "695100", compteLib: "Impots sur les benefices" },
        31_000,
        0
      ),
      entryLine(INCOME_TAX_PAYABLE, 0, 31_000),
    ]
  )
}

function addDepreciation(
  entries: DemoEntry[],
  ecritureNum: string,
  monthDate: Date
) {
  const date = monthDay(monthDate, 31)
  addLines(
    entries,
    {
      journalCode: "OD",
      journalLib: "Operations diverses",
      ecritureNum,
      ecritureDate: date,
      pieceRef: `AMORT-${monthKey(monthDate)}`,
      pieceDate: date,
      ecritureLib: "Dotation aux amortissements",
    },
    [
      entryLine(
        {
          compteNum: "681120",
          compteLib: "Dotations amortissements immobilisations",
        },
        1_850,
        0
      ),
      entryLine(
        {
          compteNum: "281830",
          compteLib: "Amortissements materiel industriel",
        },
        0,
        1_850
      ),
    ]
  )
}

function addLoanPayment(
  entries: DemoEntry[],
  ecritureNum: string,
  monthDate: Date,
  monthIndex: number
) {
  const date = monthDay(monthDate, 18)
  const principal = 1_450
  const interest = roundMoney(Math.max(210, 430 - monthIndex * 14))
  addLines(
    entries,
    {
      journalCode: "BQ",
      journalLib: "Banque",
      ecritureNum,
      ecritureDate: date,
      pieceRef: `PRET-${monthKey(monthDate)}`,
      pieceDate: date,
      ecritureLib: "Echeance emprunt bancaire",
    },
    [
      entryLine(LOAN_ACCOUNT, principal, 0),
      entryLine(
        { compteNum: "661100", compteLib: "Interets des emprunts" },
        interest,
        0
      ),
      entryLine(BANK_OPERATING, 0, principal + interest),
    ]
  )
}

function addEquipmentPurchase(
  entries: DemoEntry[],
  nextNum: () => string,
  monthDate: Date,
  endMonth: Date
) {
  const invoiceDate = monthDay(monthDate, 12)
  const amountHt = 18_600
  const vat = roundMoney(amountHt * DEFAULT_VAT_RATE)
  const amountTtc = roundMoney(amountHt + vat)
  const ref = `IMMO-${monthKey(monthDate)}`

  addLines(
    entries,
    {
      journalCode: "AC",
      journalLib: "Achats",
      ecritureNum: nextNum(),
      ecritureDate: invoiceDate,
      pieceRef: ref,
      pieceDate: invoiceDate,
      ecritureLib: "Banc de test showroom",
    },
    [
      entryLine(
        {
          compteNum: "218300",
          compteLib: "Materiel showroom et bancs de test",
        },
        amountHt,
        0
      ),
      entryLine(VAT_DEDUCTIBLE, vat, 0),
      entryLine(EQUIPMENT_SUPPLIER, 0, amountTtc),
    ]
  )

  const paymentDate = addDays(invoiceDate, 45)
  if (paymentDate <= endMonth)
    addSupplierPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate,
      account: EQUIPMENT_SUPPLIER,
      amount: amountTtc,
      ref,
      label: "Reglement investissement showroom",
    })
}

function addOpenAgedInvoices(
  entries: DemoEntry[],
  nextNum: () => string,
  endMonth: Date
) {
  for (const { customer, invoiceDaysOpen, amountHt, ref } of AGED_RECEIVABLES)
    addCustomerInvoice({
      entries,
      ecritureNum: nextNum(),
      invoiceDate: addDays(endMonth, -invoiceDaysOpen),
      customer,
      amountHt,
      ref,
    })

  for (const { supplier, invoiceDaysOpen, amountHt, ref } of AGED_PAYABLES)
    addSupplierInvoice({
      entries,
      ecritureNum: nextNum(),
      invoiceDate: addDays(endMonth, -invoiceDaysOpen),
      supplier,
      amountHt,
      ref,
    })
}

export function generateDemoEntries(): DemoEntry[] {
  const random = pseudoRandom(84)
  const entries: DemoEntry[] = []
  let entryCounter = 1
  const nextNum = () => String(entryCounter++).padStart(6, "0")

  // Periode : 12 derniers mois finissant au mois precedent du jour courant.
  const now = new Date()
  const endMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)
  )
  const startMonth = new Date(
    Date.UTC(endMonth.getUTCFullYear() - 1, endMonth.getUTCMonth() + 1, 1)
  )

  addOpeningEntries(entries, nextNum(), startMonth)
  addOpeningPayments(entries, nextNum, startMonth)

  let vatDueFromPreviousMonth = OPENING_VAT_PAYABLE

  for (let m = 0; m < 12; m++) {
    const monthDate = new Date(
      Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + m, 1)
    )
    const monthlyTarget = computeMonthlyRevenueTarget(m, monthDate)

    if (vatDueFromPreviousMonth > 0) {
      const vatPaymentDate = monthDay(monthDate, 20)
      if (vatPaymentDate <= endMonth)
        addVatPayment({
          entries,
          ecritureNum: nextNum(),
          paymentDate: vatPaymentDate,
          amount: vatDueFromPreviousMonth,
          ref: `TVA-${monthKey(monthDate)}`,
        })
    }

    let collectedVat = 0
    let deductibleVat = 0

    for (const customer of CUSTOMERS) {
      const invoiceDay = 5 + Math.floor(random() * 17)
      const invoiceDate = monthDay(monthDate, invoiceDay)
      const noise = 0.88 + random() * 0.24
      const amountHt = roundMoney(monthlyTarget * customer.weight * noise)
      const ref = `FAC-${monthKey(monthDate)}-${customer.compAuxNum?.slice(3)}`
      const amountTtc = addCustomerInvoice({
        entries,
        ecritureNum: nextNum(),
        invoiceDate,
        customer,
        amountHt,
        ref,
      })
      collectedVat += roundMoney(amountHt * DEFAULT_VAT_RATE)

      const paymentDelay =
        customer.paymentDays +
        Math.floor(random() * 10) -
        (random() > 0.65 ? 4 : 0)
      const paymentDate = addDays(invoiceDate, Math.max(18, paymentDelay))
      if (paymentDate <= endMonth)
        addCustomerPayment({
          entries,
          ecritureNum: nextNum(),
          paymentDate,
          account: customer,
          amount: amountTtc,
          ref,
          label: `Reglement ${customer.compteLib}`,
        })
    }

    for (const supplier of SUPPLIERS) {
      const amountHt = supplierAmount(supplier, monthlyTarget, m, random)
      if (amountHt <= 0) continue

      const invoiceDate = monthDay(monthDate, 8 + Math.floor(random() * 16))
      const ref = `${supplier.compAuxNum}-${monthKey(monthDate)}`
      const amountTtc = addSupplierInvoice({
        entries,
        ecritureNum: nextNum(),
        invoiceDate,
        supplier,
        amountHt,
        ref,
      })
      deductibleVat += roundMoney(amountHt * supplier.vatRate)

      const paymentDelay = supplier.paymentDays + Math.floor(random() * 6)
      const paymentDate = addDays(invoiceDate, paymentDelay)
      if (paymentDate <= endMonth)
        addSupplierPayment({
          entries,
          ecritureNum: nextNum(),
          paymentDate,
          account: supplier,
          amount: amountTtc,
          ref,
          label: `Reglement ${supplier.compteLib}`,
        })
    }

    if (m === 4) addEquipmentPurchase(entries, nextNum, monthDate, endMonth)

    addPayroll({ entries, nextNum, monthDate, monthIndex: m, endMonth })
    addTaxAccrual({ entries, nextNum, monthDate, monthlyTarget, endMonth })
    addLoanPayment(entries, nextNum(), monthDate, m)
    addDepreciation(entries, nextNum(), monthDate)

    if (m === 11) addIncomeTaxProvision(entries, nextNum, monthDate)

    vatDueFromPreviousMonth = roundMoney(
      Math.max(0, collectedVat - deductibleVat)
    )
  }

  addOpenAgedInvoices(entries, nextNum, endMonth)

  return entries
}

export function generateDemoFecText(): string {
  const headers = [
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

  const rows: string[] = [headers.join("\t")]
  const entries = generateDemoEntries()
  for (const e of entries) {
    rows.push(
      [
        e.journalCode,
        e.journalLib,
        e.ecritureNum,
        dateStr(e.ecritureDate),
        e.compteNum,
        e.compteLib,
        e.compAuxNum,
        e.compAuxLib,
        e.pieceRef,
        dateStr(e.pieceDate),
        e.ecritureLib,
        fr(e.debit),
        fr(e.credit),
        "",
        "",
        dateStr(e.ecritureDate),
        "",
        "EUR",
      ].join("\t")
    )
  }
  return rows.join("\n")
}
