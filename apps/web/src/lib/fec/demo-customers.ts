import type { Customer } from "./demo-types"

export const CUSTOMERS: readonly Customer[] = [
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

export const OPENING_RECEIVABLES: ReadonlyArray<{
  customer: Customer
  amount: number
  ref: string
}> = [
  { customer: CUSTOMERS[0], amount: 28_400, ref: "AN-CLI-SOLR" },
  { customer: CUSTOMERS[2], amount: 16_900, ref: "AN-CLI-HELI" },
]

export const AGED_RECEIVABLES: ReadonlyArray<{
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
