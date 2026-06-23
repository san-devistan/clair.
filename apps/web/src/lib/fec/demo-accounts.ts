import type { AccountRef } from "./demo-types"

export const BANK_OPERATING: AccountRef = {
  compteNum: "512001",
  compteLib: "Banque BNP - Compte exploitation",
}

export const BANK_RESERVE: AccountRef = {
  compteNum: "512100",
  compteLib: "Banque BNP - Reserve de tresorerie",
}

export const CASH_REGISTER: AccountRef = {
  compteNum: "530000",
  compteLib: "Caisse showroom",
}

export const SALARY_PAYABLE: AccountRef = {
  compteNum: "421000",
  compteLib: "Personnel - remunerations dues",
}

export const SOCIAL_URSSAF: AccountRef = {
  compteNum: "431000",
  compteLib: "URSSAF",
}

export const SOCIAL_RETIREMENT: AccountRef = {
  compteNum: "437000",
  compteLib: "Caisses de retraite et prevoyance",
}

export const VAT_COLLECTED: AccountRef = {
  compteNum: "445710",
  compteLib: "TVA collectee 20%",
}

export const VAT_DEDUCTIBLE: AccountRef = {
  compteNum: "445660",
  compteLib: "TVA deductible 20%",
}

export const LOAN_ACCOUNT: AccountRef = {
  compteNum: "164000",
  compteLib: "Emprunt bancaire moyen terme",
}

export const TAX_PAYABLE: AccountRef = {
  compteNum: "448600",
  compteLib: "Etat - charges a payer",
}

export const INCOME_TAX_PAYABLE: AccountRef = {
  compteNum: "444000",
  compteLib: "Etat - impot sur les benefices",
}

export const EQUIPMENT_SUPPLIER: AccountRef = {
  compteNum: "401EQUI",
  compteLib: "EQUINOX EQUIPEMENT",
  compAuxNum: "401EQUI",
  compAuxLib: "EQUINOX EQUIPEMENT",
}
