import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import type { ChangeEvent } from "react"

export function AuthEmailField({
  onEdit,
  value,
  onChange,
}: {
  onEdit?: () => void
  value: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const readOnly = !onChange

  return (
    <Field>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        {onEdit ? (
          <Button
            type="button"
            variant="link"
            className="h-auto px-0 text-xs text-muted-foreground"
            onClick={onEdit}
          >
            Modifier
          </Button>
        ) : null}
      </div>
      <Input
        id="email"
        type="email"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        autoComplete="email"
        className="h-10 bg-muted/30 px-3"
        placeholder="vous@entreprise.fr"
        required
      />
    </Field>
  )
}
