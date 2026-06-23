import {
  Banknote,
  ChartLine,
  CircleAlert,
  ScanLine,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react"

export const PREVIEW_BARS = [
  35, 42, 38, 51, 48, 55, 60, 49, 65, 71, 68, 78,
].map((value, index) => ({
  key: `${String(index)}-${String(value)}`,
  style: { height: `${String(value)}%` },
}))

export const FEATURES = [
  {
    icon: ChartLine,
    title: "Vue d'ensemble en 5 secondes",
    text: "Chiffre d'affaires, charges, marge et trésorerie : les indicateurs vitaux de votre entreprise sur une seule page.",
  },
  {
    icon: Target,
    title: "Actions concrètes, pas du jargon",
    text: "On vous dit où réduire les charges, quels clients relancer, quels fournisseurs renégocier. En français, pas en comptable.",
  },
  {
    icon: ScanLine,
    title: "Drill-down progressif",
    text: "Vue d'ensemble, puis zoom par section : revenus, charges, trésorerie, clients, fournisseurs. À votre rythme.",
  },
  {
    icon: ShieldCheck,
    title: "Vos données restent chez vous",
    text: "Le fichier FEC est analysé directement dans votre navigateur. Rien n'est envoyé sur nos serveurs.",
  },
]

export const STEPS = [
  {
    n: "01",
    title: "Exportez votre FEC",
    text: "Demandez le fichier des écritures comptables à votre expert-comptable, ou exportez-le depuis votre logiciel (Pennylane, Cegid, Sage, EBP, etc.).",
  },
  {
    n: "02",
    title: "Glissez-le dans Clair",
    text: "Format normalisé DGFiP. On détecte automatiquement l'encodage, les séparateurs et les colonnes.",
  },
  {
    n: "03",
    title: "Pilotez votre entreprise",
    text: "Tableau de bord clair, recommandations actionnables, alertes sur ce qui mérite votre attention.",
  },
]

export const QUESTIONS = [
  {
    icon: Banknote,
    q: "Mon entreprise gagne-t-elle vraiment de l'argent ?",
    a: "Marge nette, EBE et résultat net en clair, par mois.",
  },
  {
    icon: CircleAlert,
    q: "Suis-je trop dépendant d'un client ?",
    a: "Concentration et top clients, avec alertes si la dépendance est risquée.",
  },
  {
    icon: Wallet,
    q: "Combien de temps tient ma trésorerie ?",
    a: "Solde actuel, projection, et délais de paiement clients vs fournisseurs.",
  },
]
