import type {
  MemberRole,
  OrganizationMember,
  Organizations,
} from "./org-switcher.types"

export const EMPTY_ORGANIZATIONS: Organizations = []
export const EMPTY_MEMBERS: OrganizationMember[] = []

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  member: "Member",
  owner: "Owner",
}

export function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Une erreur est survenue."
}

export function hasManageMembersRole(role: string | undefined) {
  return (
    role
      ?.split(",")
      .map((value) => value.trim())
      .some((value) => value === "owner" || value === "admin") ?? false
  )
}

export function parseMemberRole(value: string): MemberRole {
  return value === "admin" ? "admin" : "member"
}
