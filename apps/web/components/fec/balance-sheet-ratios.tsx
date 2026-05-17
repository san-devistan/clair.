"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

import type {
  BalanceSheetRatio,
  BalanceSheetRatioStatus,
  BalanceSheetSummary,
} from "@/lib/fec/balance-sheet-types"
import { formatAccurateNumber, formatPercent } from "@/lib/fec/format"

const STATUS_LABELS: Record<BalanceSheetRatioStatus, string> = {
  good: "Sain",
  watch: "À surveiller",
  risk: "Risque",
  info: "Non applicable",
}

export function BalanceSheetRatioGrid({
  balanceSheet,
}: {
  balanceSheet: BalanceSheetSummary
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {balanceSheet.ratios.map((ratio) => (
        <Card key={ratio.key}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {ratio.label}
                </p>
                <p className="mt-1 font-heading text-3xl font-bold tabular-nums">
                  {formatRatioValue(ratio)}
                </p>
              </div>
              <StatusBadge status={ratio.status} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">{ratio.formula}</p>
            <Separator />
            <RatioExplanation ratio={ratio} balanceSheet={balanceSheet} />
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

export function BalanceSheetRatioSummary({
  ratio,
}: {
  ratio: BalanceSheetRatio
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {ratio.label}
        </p>
        <StatusBadge status={ratio.status} />
      </div>
      <p className="mt-2 font-heading text-2xl font-bold tabular-nums">
        {formatRatioValue(ratio)}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: BalanceSheetRatioStatus }) {
  return (
    <Badge
      variant={status === "risk" ? "destructive" : "secondary"}
      className={cn(status === "good" && "text-emerald-700")}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}

function RatioExplanation({
  ratio,
  balanceSheet,
}: {
  ratio: BalanceSheetRatio
  balanceSheet: BalanceSheetSummary
}) {
  return (
    <div className="flex flex-col gap-2 text-sm leading-relaxed">
      <p>{ratioInterpretation(ratio, balanceSheet)}</p>
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">Décision : </span>
        {ratioDecision(ratio)}
      </p>
    </div>
  )
}

function formatRatioValue(ratio: BalanceSheetRatio): string {
  if (ratio.value === null) return "n.c."
  if (ratio.unit === "percent") return formatPercent(ratio.value * 100)
  if (ratio.unit === "months")
    return `${formatAccurateNumber(ratio.value)} mois`
  if (ratio.unit === "times")
    return `${formatAccurateNumber(ratio.value)} fois/an`
  return `${formatAccurateNumber(ratio.value)}x`
}

function ratioInterpretation(
  ratio: BalanceSheetRatio,
  balanceSheet: BalanceSheetSummary
): string {
  if (ratio.key === "currentLiquidity")
    return currentLiquidityInterpretation(ratio.value)
  if (ratio.key === "debtToEquity")
    return debtToEquityInterpretation(ratio.value, balanceSheet.funding.equity)
  if (ratio.key === "inventoryTurnover")
    return inventoryTurnoverInterpretation(
      ratio.value,
      balanceSheet.assets.inventory
    )
  if (ratio.key === "cashRunway") return cashRunwayInterpretation(ratio.value)
  return equityRatioInterpretation(ratio.value)
}

function ratioDecision(ratio: BalanceSheetRatio): string {
  if (ratio.key === "currentLiquidity")
    return ratio.status === "risk"
      ? "sécuriser les encaissements, étaler certaines sorties ou chercher un financement court terme."
      : "garder ce coussin au-dessus de 1 pour éviter que les dettes courtes ne pilotent la trésorerie."
  if (ratio.key === "debtToEquity")
    return ratio.status === "risk"
      ? "limiter les nouveaux emprunts, renforcer les fonds propres ou rééchelonner la dette existante."
      : "conserver de la marge d'emprunt pour les investissements vraiment prioritaires."
  if (ratio.key === "inventoryTurnover")
    return ratio.status === "watch"
      ? "ajuster les achats au rythme réel des ventes et vérifier les références lentes."
      : "continuer à suivre les stocks, surtout si l'activité est saisonnière."
  if (ratio.key === "cashRunway")
    return ratio.status === "risk"
      ? "traiter la trésorerie comme priorité immédiate : recouvrement, dépenses variables et échéances."
      : "maintenir au moins un mois de charges couvert par la trésorerie nette."
  return ratio.status === "risk"
    ? "reconstituer les capitaux propres avant de dépendre davantage de la dette."
    : "préserver cet équilibre entre capitaux propres et dettes."
}

function currentLiquidityInterpretation(value: number | null): string {
  if (value === null)
    return "Aucun passif courant significatif n'est identifié dans le FEC, le ratio n'est donc pas exploitable."
  if (value < 1)
    return "Les actifs courants ne couvrent pas les dettes courantes : la marge de sécurité court terme est faible."
  if (value < 1.2)
    return "L'entreprise couvre ses dettes courantes, mais avec peu de marge si les encaissements ralentissent."
  return `L'entreprise dispose d'environ ${formatAccurateNumber(value)} fois ses dettes courantes en actifs mobilisables.`
}

function debtToEquityInterpretation(
  value: number | null,
  equity: number
): string {
  if (equity <= 0)
    return "Les capitaux propres sont négatifs ou nuls : le bilan dépend surtout des dettes et du redressement du résultat."
  if (value === null)
    return "Le ratio n'est pas exploitable car les capitaux propres ne sont pas positifs."
  if (value > 2)
    return `L'entreprise porte ${formatAccurateNumber(value)} euro de dette pour 1 euro de capitaux propres : l'endettement est élevé.`
  if (value > 1)
    return `L'entreprise porte ${formatAccurateNumber(value)} euro de dette pour 1 euro de capitaux propres : l'effet de levier doit rester maîtrisé.`
  return `L'entreprise porte ${formatAccurateNumber(value)} euro de dette pour 1 euro de capitaux propres : la structure reste lisible.`
}

function inventoryTurnoverInterpretation(
  value: number | null,
  inventory: number
) {
  if (inventory <= 0 || value === null)
    return "Aucun stock significatif n'est visible au bilan. Ce ratio peut être ignoré pour une activité sans stock."
  if (value < 3)
    return "Les stocks tournent lentement : du cash peut être immobilisé trop longtemps."
  if (value > 12)
    return "Les stocks tournent très vite : c'est efficace, mais il faut surveiller les ruptures."
  return `Les stocks sont renouvelés environ ${formatAccurateNumber(value)} fois par an, signe d'une rotation équilibrée.`
}

function cashRunwayInterpretation(value: number | null): string {
  if (value === null)
    return "Les charges mensuelles ne permettent pas de calculer une autonomie de trésorerie exploitable."
  if (value < 0)
    return "La trésorerie nette est négative : le bilan signale une tension immédiate."
  if (value < 1)
    return "La trésorerie nette couvre moins d'un mois de charges moyennes."
  return `La trésorerie nette couvre environ ${formatAccurateNumber(value)} mois de charges moyennes.`
}

function equityRatioInterpretation(value: number | null): string {
  if (value === null)
    return "Le total actif est nul ou non exploitable, le ratio ne peut pas être interprété."
  if (value < 0.15)
    return "Les capitaux propres représentent une faible part du bilan : la résilience financière est limitée."
  if (value < 0.3)
    return "L'autonomie financière est correcte mais encore sensible aux pertes ou à un nouvel emprunt."
  return "Les capitaux propres financent une part solide du bilan."
}
