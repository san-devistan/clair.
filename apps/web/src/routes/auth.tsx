"use client"

import { authClient } from "@/lib/auth/client"
import { useRouter } from "@/lib/navigation"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Building2, LogIn, UserPlus } from "lucide-react"
import {
  useCallback,
  useEffect,
  useReducer,
  type ChangeEvent,
  type FormEvent,
} from "react"

type AuthMode = "sign-in" | "sign-up"
type AuthSearch = { redirect?: string }
type AuthState = {
  email: string
  error: string | null
  mode: AuthMode
  name: string
  password: string
  submitting: boolean
}

type AuthAction =
  | { type: "patch"; patch: Partial<AuthState> }
  | { type: "toggle-mode" }

const INITIAL_AUTH_STATE: AuthState = {
  email: "",
  error: null,
  mode: "sign-in",
  name: "",
  password: "",
  submitting: false,
}

function validateSearch(search: Record<string, unknown>): AuthSearch {
  const redirect = typeof search.redirect === "string" ? search.redirect : ""

  return {
    redirect: redirect.startsWith("/") ? redirect : undefined,
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Une erreur est survenue."
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch }
    case "toggle-mode":
      return {
        ...state,
        error: null,
        mode: state.mode === "sign-in" ? "sign-up" : "sign-in",
      }
    default:
      return state
  }
}

export const Route = createFileRoute("/auth")({
  validateSearch,
  component: AuthPage,
})

function AuthPage() {
  const { redirect } = Route.useSearch()
  const { replace } = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE)
  const redirectTo = redirect ?? "/dashboard"
  const isSignUp = state.mode === "sign-up"

  useEffect(() => {
    if (!isPending && session) {
      replace(redirectTo)
    }
  }, [isPending, redirectTo, replace, session])

  const title = isSignUp ? "Créer un compte" : "Connexion"
  const actionLabel = isSignUp ? "Créer le compte" : "Se connecter"
  const ActionIcon = isSignUp ? UserPlus : LogIn

  const switchMode = useCallback(() => {
    dispatch({ type: "toggle-mode" })
  }, [])

  const changeName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "patch", patch: { name: event.target.value } })
  }, [])

  const changeEmail = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "patch", patch: { email: event.target.value } })
  }, [])

  const changePassword = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "patch", patch: { password: event.target.value } })
  }, [])

  const submitAuth = useCallback(async () => {
    dispatch({ type: "patch", patch: { error: null, submitting: true } })

    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            name: state.name.trim(),
            email: state.email.trim().toLowerCase(),
            password: state.password,
          })
        : await authClient.signIn.email({
            email: state.email.trim().toLowerCase(),
            password: state.password,
          })

      if (result.error) {
        dispatch({
          type: "patch",
          patch: {
            error: result.error.message ?? "Authentification impossible.",
          },
        })
        return
      }

      replace(redirectTo)
    } catch (caughtError) {
      dispatch({
        type: "patch",
        patch: { error: getErrorMessage(caughtError) },
      })
    } finally {
      dispatch({ type: "patch", patch: { submitting: false } })
    }
  }, [isSignUp, redirectTo, replace, state.email, state.name, state.password])

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void submitAuth()
    },
    [submitAuth]
  )

  const modeButtonText = isSignUp ? "J'ai déjà un compte" : "Créer un compte"

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border bg-background p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-foreground text-background">
            <Building2 className="size-4" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">Clair</p>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <FieldGroup>
            {isSignUp ? (
              <Field>
                <FieldLabel htmlFor="name">Nom</FieldLabel>
                <Input
                  id="name"
                  value={state.name}
                  onChange={changeName}
                  autoComplete="name"
                  required
                />
              </Field>
            ) : null}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={state.email}
                onChange={changeEmail}
                autoComplete="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <Input
                id="password"
                type="password"
                value={state.password}
                onChange={changePassword}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={8}
                required
              />
              {isSignUp ? (
                <FieldDescription>Minimum 8 caractères.</FieldDescription>
              ) : null}
            </Field>
            <FieldError>{state.error}</FieldError>
          </FieldGroup>

          <Button type="submit" disabled={state.submitting}>
            <ActionIcon />
            {actionLabel}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full"
          onClick={switchMode}
        >
          {modeButtonText}
        </Button>
      </section>
    </main>
  )
}
