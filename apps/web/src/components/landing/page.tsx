import { FormattedCurrency } from "@/components/fec/formatted-number"
import {
  FEATURES,
  PREVIEW_BARS,
  QUESTIONS,
  STEPS,
} from "@/components/landing/data"
import Link from "@/components/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { ArrowRight, CircleAlert, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"

const FEATURES_LINK = <Link href="#fonctionnalites" />
const STEPS_LINK = <Link href="#fonctionnement" />
const PRIVACY_LINK = <Link href="#confidentialite" />
const UPLOAD_LINK = <Link href="/upload" />
const DEMO_LINK = <Link href="/dashboard?demo=1" />
const CURRENT_YEAR = new Date().getFullYear()

export function HomePage() {
  return (
    <div className="relative min-h-svh overflow-hidden">
      <PageBackground />
      <Header />
      <main className="relative mx-auto w-full max-w-6xl px-6 pb-24">
        <HeroSection />
        <FeaturesSection />
        <QuestionsSection />
        <StepsSection />
        <PrivacySection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

function PageBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
    </>
  )
}

function Header() {
  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between p-6">
      <div className="flex items-center gap-2.5">
        <img
          src="/logo.svg"
          alt=""
          className="size-8 rounded-lg"
          aria-hidden="true"
        />
        <span className="font-heading text-lg font-semibold tracking-tight">
          Clair
        </span>
      </div>
      <nav className="hidden items-center gap-1 md:flex">
        <Button variant="ghost" size="sm" render={FEATURES_LINK}>
          Fonctionnalités
        </Button>
        <Button variant="ghost" size="sm" render={STEPS_LINK}>
          Comment ça marche
        </Button>
        <Button variant="ghost" size="sm" render={PRIVACY_LINK}>
          Confidentialité
        </Button>
      </nav>
      <Button size="sm" render={UPLOAD_LINK}>
        Commencer
        <ArrowRight />
      </Button>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="grid gap-10 pt-12 pb-20 md:grid-cols-[1.2fr_1fr] md:items-center md:pt-20">
      <div>
        <Badge variant="secondary" className="mb-6 rounded-full px-3 py-1">
          Pour dirigeants, pas pour comptables
        </Badge>
        <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
          La santé de votre entreprise,
          <br />
          <span className="text-primary">en clair.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Importez votre fichier FEC, obtenez immédiatement un tableau de bord
          lisible, avec des actions concrètes à mener pour augmenter vos ventes,
          réduire vos charges, et sécuriser votre trésorerie.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" render={UPLOAD_LINK}>
            Importer mon FEC
            <ArrowRight />
          </Button>
          <Button size="lg" variant="outline" render={DEMO_LINK}>
            Voir une démo
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Aucun compte requis, vos données ne quittent pas votre navigateur.
        </p>
      </div>
      <DashboardPreview />
    </section>
  )
}

function DashboardPreview() {
  return (
    <div className="relative">
      <Card className="relative overflow-hidden p-0">
        <PreviewChrome />
        <div className="space-y-4 p-6">
          <PreviewKpis />
          <PreviewChart />
          <PreviewWarning />
        </div>
      </Card>
    </div>
  )
}

function PreviewChrome() {
  return (
    <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
      <div className="size-2.5 rounded-full bg-destructive/40" />
      <div className="size-2.5 rounded-full bg-amber-500/40" />
      <div className="size-2.5 rounded-full bg-emerald-500/40" />
      <span className="ml-2 text-xs text-muted-foreground">
        clair.app/dashboard
      </span>
    </div>
  )
}

function PreviewKpis() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border bg-card p-3 text-card-foreground">
        <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
        <p className="font-heading text-2xl font-semibold">
          <FormattedCurrency value={812_000} />
        </p>
        <p className="mt-0.5 text-xs text-emerald-600">+18% vs N-1</p>
      </div>
      <div className="rounded-lg border bg-card p-3 text-card-foreground">
        <p className="text-xs text-muted-foreground">Marge nette</p>
        <p className="font-heading text-2xl font-semibold">12,4%</p>
        <p className="mt-0.5 text-xs text-amber-600">En recul</p>
      </div>
    </div>
  )
}

function PreviewChart() {
  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      <p className="mb-2 text-xs text-muted-foreground">
        Évolution sur 12 mois
      </p>
      <div className="flex h-20 items-end gap-1">
        {PREVIEW_BARS.map((bar) => (
          <div
            key={bar.key}
            className="flex-1 rounded-sm bg-primary/70 transition-colors hover:bg-primary"
            style={bar.style}
          />
        ))}
      </div>
    </div>
  )
}

function PreviewWarning() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
      <div className="flex items-start gap-2">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold">
            3 clients représentent 64% du CA
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Forte dépendance. Action : élargir le portefeuille.
          </p>
        </div>
      </div>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="border-t py-20">
      <SectionTitle
        badge="Fonctionnalités"
        title={
          <>
            Tout ce qu'un dirigeant veut savoir,
            <br />
            rien de ce qui l'embrouille.
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ badge, title }: { badge: string; title: ReactNode }) {
  return (
    <div className="mb-12 max-w-2xl">
      <Badge variant="outline" className="mb-4 rounded-full">
        {badge}
      </Badge>
      <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
    </div>
  )
}

function FeatureCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  const Icon = feature.icon

  return (
    <Card className="p-6">
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mb-2 font-heading text-lg font-semibold">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {feature.text}
      </p>
    </Card>
  )
}

function QuestionsSection() {
  return (
    <section className="border-t py-20">
      <SectionTitle
        badge="Vos questions, en réponses claires"
        title="Les 3 questions qui vous empêchent de dormir."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {QUESTIONS.map((question) => (
          <QuestionCard key={question.q} question={question} />
        ))}
      </div>
    </section>
  )
}

function QuestionCard({ question }: { question: (typeof QUESTIONS)[number] }) {
  const Icon = question.icon

  return (
    <Card className="border-primary/10 p-6">
      <Icon className="mb-4 size-5 text-primary" />
      <p className="font-heading text-base leading-snug font-semibold">
        {question.q}
      </p>
      <Separator className="my-4" />
      <p className="text-sm text-muted-foreground">{question.a}</p>
    </Card>
  )
}

function StepsSection() {
  return (
    <section id="fonctionnement" className="border-t py-20">
      <SectionTitle
        badge="Comment ça marche"
        title="3 étapes, moins de 2 minutes."
      />
      <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
        {STEPS.map((step) => (
          <StepCard key={step.n} step={step} />
        ))}
      </div>
    </section>
  )
}

function StepCard({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <div className="bg-background p-8">
      <p className="mb-4 font-heading text-sm font-semibold text-primary">
        {step.n}
      </p>
      <h3 className="mb-3 font-heading text-lg font-semibold">{step.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {step.text}
      </p>
    </div>
  )
}

function PrivacySection() {
  return (
    <section
      id="confidentialite"
      className="mt-20 rounded-3xl border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-10 md:p-16"
    >
      <div className="grid gap-8 md:grid-cols-[2fr_3fr] md:items-center">
        <div>
          <ShieldCheck className="mb-4 size-10 text-primary" />
          <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Vos comptes restent chez vous.
          </h2>
        </div>
        <PrivacyContent />
      </div>
    </section>
  )
}

function PrivacyContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Le fichier FEC contient toutes les écritures comptables de votre
        entreprise. C'est une donnée sensible.
      </p>
      <p className="text-muted-foreground">
        Clair fonctionne entièrement dans votre navigateur. Le parsing, les
        calculs, et le stockage local, tout reste sur votre machine. Aucun envoi
        vers un serveur, aucun compte à créer, aucune trace ailleurs que chez
        vous.
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        <Badge variant="secondary">100% client-side</Badge>
        <Badge variant="secondary">localStorage chiffré navigateur</Badge>
        <Badge variant="secondary">Sans inscription</Badge>
      </div>
    </div>
  )
}

function CtaSection() {
  return (
    <section className="mt-20 text-center">
      <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight md:text-5xl">
        Prêt à voir votre entreprise en clair&nbsp;?
      </h2>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" render={UPLOAD_LINK}>
          Importer mon FEC
          <ArrowRight />
        </Button>
        <Button size="lg" variant="outline" render={DEMO_LINK}>
          Tester avec une démo
        </Button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 p-6 text-xs text-muted-foreground md:flex-row">
        <p>
          © {String(CURRENT_YEAR)} Clair · Pilotez votre entreprise sans avoir à
          comprendre la comptabilité.
        </p>
        <p>
          Astuce&nbsp;: appuyez sur{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5">d</kbd> pour le mode
          sombre.
        </p>
      </div>
    </footer>
  )
}
