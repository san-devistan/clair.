"use client"

import { AuthFormCard } from "@/components/auth/auth-form-card"
import { AuthPageLayout } from "@/components/auth/auth-page-layout"
import { authClient } from "@/lib/auth/client"
import { useRouter } from "@/lib/navigation"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "@workspace/backend/api"
import { useConvex } from "convex/react"
import {
  useCallback,
  useEffect,
  useReducer,
  type ChangeEvent,
  type FormEvent,
} from "react"

type AuthMode = "sign-in" | "sign-up"
type AuthStep = "email" | "password"
type AuthSearch = { redirect?: string }
type AuthState = {
  email: string
  error: string | null
  mode: AuthMode
  password: string
  showPassword: boolean
  step: AuthStep
  submitting: boolean
}

type AuthAction =
  | { type: "patch"; patch: Partial<AuthState> }
  | { type: "toggle-password" }

const INITIAL_AUTH_STATE: AuthState = {
  email: "",
  error: null,
  mode: "sign-in",
  password: "",
  showPassword: false,
  step: "email",
  submitting: false,
}

type AuthResult = { type: "success" } | { type: "error"; message: string }
type SignUpInput = {
  email: string
  password: string
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getResponseMessage(data: unknown) {
  if (!isRecord(data)) {
    return null
  }

  if (typeof data.message === "string") {
    return data.message
  }

  if (isRecord(data.error) && typeof data.error.message === "string") {
    return data.error.message
  }

  return null
}

async function getAuthResponseError(response: Response) {
  const data: unknown = await response.json().catch(() => null)

  return getResponseMessage(data) ?? "Authentification impossible."
}

async function signUpWithEmail({
  email,
  password,
}: SignUpInput): Promise<AuthResult> {
  const response = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (response.ok) {
    return { type: "success" }
  }

  return { type: "error", message: await getAuthResponseError(response) }
}

async function signInWithEmail({
  email,
  password,
}: SignUpInput): Promise<AuthResult> {
  const result = await authClient.signIn.email({ email, password })

  if (result.error) {
    return {
      type: "error",
      message: result.error.message ?? "Authentification impossible.",
    }
  }

  return { type: "success" }
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch }
    case "toggle-password":
      return { ...state, showPassword: !state.showPassword }
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
  const convex = useConvex()
  const { data: session, isPending } = authClient.useSession()
  const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE)
  const redirectTo = redirect ?? "/dashboard"
  const isPasswordStep = state.step === "password"
  const isSignUp = isPasswordStep && state.mode === "sign-up"

  useEffect(() => {
    if (!isPending && session) {
      replace(redirectTo)
    }
  }, [isPending, redirectTo, replace, session])

  const title = getAuthTitle(state.step, state.mode)
  const subtitle = getAuthSubtitle(state.step, state.mode)
  const actionLabel = getAuthActionLabel(
    state.step,
    state.mode,
    state.submitting
  )

  const togglePasswordVisibility = useCallback(() => {
    dispatch({ type: "toggle-password" })
  }, [])

  const changeEmail = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "patch", patch: { email: event.target.value } })
  }, [])

  const changePassword = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "patch", patch: { password: event.target.value } })
  }, [])

  const editEmail = useCallback(() => {
    dispatch({
      type: "patch",
      patch: {
        error: null,
        mode: "sign-in",
        password: "",
        showPassword: false,
        step: "email",
      },
    })
  }, [])

  const submitAuth = useCallback(async () => {
    dispatch({ type: "patch", patch: { error: null, submitting: true } })

    try {
      const email = state.email.trim().toLowerCase()

      if (state.step === "email") {
        if (!email) {
          dispatch({
            type: "patch",
            patch: { error: "Email requis." },
          })
          return
        }

        const status = await convex.query(api.auth.getEmailAuthStatus, {
          email,
        })

        dispatch({
          type: "patch",
          patch: {
            email,
            error: null,
            mode: status.exists ? "sign-in" : "sign-up",
            password: "",
            showPassword: false,
            step: "password",
          },
        })
        return
      }

      const result = isSignUp
        ? await signUpWithEmail({
            email,
            password: state.password,
          })
        : await signInWithEmail({
            email,
            password: state.password,
          })

      if (result.type === "error") {
        dispatch({
          type: "patch",
          patch: {
            error: result.message,
          },
        })
        return
      }

      await authClient.getSession()

      replace(redirectTo)
    } catch (caughtError) {
      dispatch({
        type: "patch",
        patch: { error: getErrorMessage(caughtError) },
      })
    } finally {
      dispatch({ type: "patch", patch: { submitting: false } })
    }
  }, [
    convex,
    isSignUp,
    redirectTo,
    replace,
    state.email,
    state.password,
    state.step,
  ])

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void submitAuth()
    },
    [submitAuth]
  )

  return (
    <AuthPageLayout>
      <AuthFormCard
        title={title}
        subtitle={subtitle}
        email={state.email}
        password={state.password}
        error={state.error}
        isSignUp={isSignUp}
        showPassword={state.showPassword}
        submitting={state.submitting}
        step={state.step}
        actionLabel={actionLabel}
        onSubmit={submit}
        onEditEmail={editEmail}
        onEmailChange={changeEmail}
        onPasswordChange={changePassword}
        onTogglePasswordVisibility={togglePasswordVisibility}
      />
    </AuthPageLayout>
  )
}

function getAuthTitle(step: AuthStep, mode: AuthMode) {
  if (step === "email") {
    return "Connexion ou inscription"
  }

  return mode === "sign-up" ? "Créer un compte" : "Connexion"
}

function getAuthSubtitle(step: AuthStep, mode: AuthMode) {
  if (step === "email") {
    return "Entrez votre email pour continuer."
  }

  return mode === "sign-up"
    ? "Aucun compte n'existe encore pour cet email."
    : "Entrez votre mot de passe."
}

function getAuthActionLabel(
  step: AuthStep,
  mode: AuthMode,
  submitting: boolean
) {
  if (step === "email") {
    return submitting ? "Vérification..." : "Continuer"
  }

  if (mode === "sign-up") {
    return submitting ? "Création..." : "Créer le compte"
  }

  return submitting ? "Connexion..." : "Se connecter"
}
