import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Eye, EyeOff } from "lucide-react"
import type { ChangeEvent } from "react"

export function AuthPasswordField({
  isSignUp,
  showPassword,
  value,
  onChange,
  onToggleVisibility,
}: {
  isSignUp: boolean
  showPassword: boolean
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onToggleVisibility: () => void
}) {
  const VisibilityIcon = showPassword ? EyeOff : Eye
  const visibilityLabel = showPassword
    ? "Masquer le mot de passe"
    : "Afficher le mot de passe"

  return (
    <Field>
      <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={8}
          className="h-10 bg-muted/30 px-3 pr-10"
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute inset-y-0 right-1 my-auto text-muted-foreground active:not-aria-[haspopup]:translate-y-0"
          onClick={onToggleVisibility}
        >
          <VisibilityIcon className="size-4" />
          <span className="sr-only">{visibilityLabel}</span>
        </Button>
      </div>
      {isSignUp ? (
        <FieldDescription>Minimum 8 caractères.</FieldDescription>
      ) : null}
    </Field>
  )
}
