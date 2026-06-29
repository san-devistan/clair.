import { FormattedNumber } from "@/components/fec/numbers/formatted"
import { CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

function PaymentDelayContent({ dso, dpo }: { dso: number; dpo: number }) {
  return (
    <CardContent className="space-y-4">
      <PaymentDelayBlock
        label="DSO · Vous payent vos clients"
        value={dso}
        description={dsoDescription(dso)}
      />
      <PaymentDelayBlock
        label="DPO · Vous payez vos fournisseurs"
        value={dpo}
        description={dpoDescription(dpo)}
      />
    </CardContent>
  )
}

function PaymentDelayBlock({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading text-2xl font-semibold tabular-nums">
          <FormattedNumber value={value} />{" "}
          <span className="text-sm text-muted-foreground">jours</span>
        </p>
      </div>
      <Separator />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function dsoDescription(dso: number) {
  if (dso > 60)
    return `Vos clients mettent en moyenne ${dso.toFixed(0)} jours à régler. Au-dessus de 60 jours, l'encaissement pèse fortement sur la trésorerie.`
  if (dso > 45)
    return "Délai intermédiaire : l'encaissement reste correct, mais le cash reste dehors plus longtemps."
  return "Délai sain. Vos clients règlent rapidement."
}

function dpoDescription(dpo: number) {
  if (dpo < 30)
    return "Paiement rapide : le cash sort tôt par rapport au cycle fournisseur."
  if (dpo > 60)
    return "Vous payez tard. Attention au risque de litige et aux pénalités de retard légales (loi LME)."
  return "Délai standard. Bon équilibre entre relation fournisseur et trésorerie."
}

export { PaymentDelayContent }
