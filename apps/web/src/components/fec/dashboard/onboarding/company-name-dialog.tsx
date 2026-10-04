"use client"

import { authClient } from "@/lib/auth/client"
import { useRouter } from "@/lib/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Loader2, Save } from "lucide-react"
import {
  useCallback,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react"

type FormState = {
  error: string | null
  organizationId: string | null
  organizationName: string
}

const EMPTY_FORM_STATE: FormState = {
  error: null,
  organizationId: null,
  organizationName: "",
}

export function DashboardCompanyNameDialog({ open }: { open: boolean }) {
  const { replace } = useRouter()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM_STATE)
  const [pending, setPending] = useState(false)

  if (
    open &&
    activeOrganization &&
    formState.organizationId !== activeOrganization.id
  ) {
    setFormState({
      error: null,
      organizationId: activeOrganization.id,
      organizationName: activeOrganization.name,
    })
  }

  const changeOrganizationName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({
        ...current,
        error: null,
        organizationName: event.target.value,
      }))
    },
    []
  )

  const submitOrganizationName = useCallback(async () => {
    if (!activeOrganization) {
      setFormState((current) => ({
        ...current,
        error: "Aucune entreprise active.",
      }))
      return
    }

    const name = formState.organizationName.trim()
    if (!name) {
      setFormState((current) => ({
        ...current,
        error: "Le nom de l'entreprise est requis.",
      }))
      return
    }

    setPending(true)
    setFormState((current) => ({ ...current, error: null }))
    try {
      if (name !== activeOrganization.name.trim()) {
        const result = await authClient.organization.update({
          organizationId: activeOrganization.id,
          data: { name },
        })
        if (result.error) {
          setFormState((current) => ({
            ...current,
            error:
              result.error.message ?? "Impossible de modifier l'entreprise.",
          }))
          return
        }
      }

      await authClient.organization.setActive({
        organizationId: activeOrganization.id,
      })
      replace("/dashboard")
    } catch (caughtError) {
      setFormState((current) => ({
        ...current,
        error: getErrorMessage(caughtError),
      }))
    } finally {
      setPending(false)
    }
  }, [activeOrganization, formState.organizationName, replace])

  const submit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      void submitOrganizationName()
    },
    [submitOrganizationName]
  )

  return (
    <Dialog open={open && Boolean(activeOrganization)}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Nom de votre entreprise</DialogTitle>
          <DialogDescription>
            Vous pourrez le modifier plus tard dans les reglages.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="dashboard-company-name">
                Entreprise
              </FieldLabel>
              <Input
                id="dashboard-company-name"
                value={formState.organizationName}
                onChange={changeOrganizationName}
                placeholder="Entreprise Dupont"
                autoComplete="organization"
                disabled={pending}
              />
            </Field>
            <FieldError>{formState.error}</FieldError>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />}
              Continuer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Impossible de continuer."
}
