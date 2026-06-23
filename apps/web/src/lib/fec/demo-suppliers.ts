import { DEFAULT_VAT_RATE } from "./demo-constants"
import type { AccountRef, Supplier } from "./demo-types"

export const SUPPLIERS: readonly Supplier[] = [
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

export const OPENING_PAYABLES: ReadonlyArray<{
  supplier: AccountRef
  amount: number
  ref: string
}> = [
  { supplier: SUPPLIERS[0], amount: 15_600, ref: "AN-FOU-LUMC" },
  { supplier: SUPPLIERS[5], amount: 4_800, ref: "AN-FOU-COWO" },
]

export const AGED_PAYABLES: ReadonlyArray<{
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
