import { AuthEmailField } from "@/components/auth/auth-email-field"
import { AuthPasswordField } from "@/components/auth/auth-password-field"
import { ClairMark } from "@/components/clair-mark"
import { Button } from "@workspace/ui/components/button"
import { FieldError, FieldGroup } from "@workspace/ui/components/field"
import type { ChangeEvent, FormEvent } from "react"

type AuthFormCardProps = {
  actionLabel: string
  email: string
  error: string | null
  isSignUp: boolean
  password: string
  showPassword: boolean
  submitting: boolean
  step: "email" | "password"
  subtitle: string
  title: string
  onEditEmail: () => void
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onTogglePasswordVisibility: () => void
}

export function AuthFormCard({
  actionLabel,
  email,
  error,
  isSignUp,
  password,
  showPassword,
  submitting,
  step,
  subtitle,
  title,
  onEditEmail,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onTogglePasswordVisibility,
}: AuthFormCardProps) {
  const showPasswordStep = step === "password"

  return (
    <section className="w-full max-w-[26rem] rounded-2xl border bg-background/75 p-2 shadow-2xl shadow-primary/15 backdrop-blur">
      <div className="rounded-xl border border-border/70 bg-background px-5 py-6 sm:px-6">
        <div className="mb-7 flex flex-col items-center text-center">
          <ClairMark size="lg" />
          <h1 className="mt-4 font-heading text-2xl font-semibold">{title}</h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <FieldGroup className="gap-4">
            <AuthEmailField
              value={email}
              onChange={showPasswordStep ? undefined : onEmailChange}
              onEdit={showPasswordStep ? onEditEmail : undefined}
            />
            {showPasswordStep ? (
              <AuthPasswordField
                isSignUp={isSignUp}
                showPassword={showPassword}
                value={password}
                onChange={onPasswordChange}
                onToggleVisibility={onTogglePasswordVisibility}
              />
            ) : null}
            <FieldError>{error}</FieldError>
          </FieldGroup>

          <Button type="submit" disabled={submitting} className="h-10 w-full">
            {actionLabel}
          </Button>
        </form>
      </div>
    </section>
  )
}
