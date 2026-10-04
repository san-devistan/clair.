import { ConvexError } from "convex/values"

import type { createAuth } from "./betterAuth/auth"
import { findAuthMany } from "./billingLib"

const DEFAULT_ORGANIZATION_NAME = "Mon Entreprise"
const DEFAULT_ORGANIZATION_SLUG = "mon-entreprise"

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
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

export async function acceptPendingInvitationsForUser(
  ctx: Parameters<typeof listPendingInvitationsByEmail>[0],
  auth: ReturnType<typeof createAuth>,
  headers: Headers,
  email: string
) {
  const invitations = await listPendingInvitationsByEmail(ctx, email)
  const invitationIds = invitations
    .map((invitation) => getString(invitation.id))
    .filter(Boolean)

  await Promise.all(
    invitationIds.map((invitationId) =>
      auth.api.acceptInvitation({
        body: { invitationId },
        headers,
      })
    )
  )

  return invitationIds.length
}

async function listPendingInvitationsByEmail(
  ctx: Parameters<typeof findAuthMany>[0],
  email: string
) {
  return await findAuthMany(ctx, "invitation", [
    { field: "email", value: normalizeEmail(email) },
    { connector: "AND", field: "status", value: "pending" },
  ])
}

export async function listUserMemberships(
  ctx: Parameters<typeof findAuthMany>[0],
  userIds: string | string[]
) {
  const ids = Array.isArray(userIds) ? userIds : [userIds]
  const memberships = await Promise.all(
    ids.map((userId) =>
      findAuthMany(ctx, "member", [{ field: "userId", value: userId }])
    )
  )

  return memberships.flat()
}

export async function createDefaultOrganization(
  auth: ReturnType<typeof createAuth>,
  headers: Headers,
  userId: string
) {
  return await createDefaultOrganizationWithSlug(
    auth,
    headers,
    getDefaultOrganizationSlugCandidates(userId),
    null
  )
}

async function createDefaultOrganizationWithSlug(
  auth: ReturnType<typeof createAuth>,
  headers: Headers,
  slugs: string[],
  lastCollision: unknown
): ReturnType<ReturnType<typeof createAuth>["api"]["createOrganization"]> {
  const [slug, ...remainingSlugs] = slugs
  if (!slug) {
    if (lastCollision instanceof Error) {
      throw lastCollision
    }

    throw new ConvexError("Unable to create a unique organization slug")
  }

  try {
    return await auth.api.createOrganization({
      body: {
        name: DEFAULT_ORGANIZATION_NAME,
        slug,
      },
      headers,
    })
  } catch (error) {
    if (!isOrganizationAlreadyExistsError(error)) {
      throw error
    }

    return await createDefaultOrganizationWithSlug(
      auth,
      headers,
      remainingSlugs,
      error
    )
  }
}

function getDefaultOrganizationSlugCandidates(userId: string) {
  const userSlug = makeSlug(userId).slice(0, 24)
  const baseSlug = userSlug
    ? `${DEFAULT_ORGANIZATION_SLUG}-${userSlug}`
    : DEFAULT_ORGANIZATION_SLUG
  return Array.from({ length: 20 }, (_, index) =>
    index === 0 ? baseSlug : `${baseSlug}-${index + 1}`
  )
}

function isOrganizationAlreadyExistsError(error: unknown) {
  return getStringFromRecord(error, "message") === "Organization already exists"
}

export function getActiveOrganizationId(
  memberships: Array<Record<string, unknown>>
) {
  return getString(memberships[0]?.organizationId) || null
}

export function countOwnedMemberships(
  memberships: Array<Record<string, unknown>>
) {
  return memberships.filter((membership) =>
    roleIncludes(getString(membership.role), "owner")
  ).length
}

function roleIncludes(role: string, expectedRole: string) {
  return role
    .split(",")
    .map((value) => value.trim())
    .includes(expectedRole)
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function getStringFromRecord(value: unknown, key: string) {
  if (typeof value !== "object" || value === null) {
    return ""
  }

  const field: unknown = Object.getOwnPropertyDescriptor(value, key)?.value
  return typeof field === "string" ? field : ""
}

export function getUserId(user: unknown) {
  if (typeof user !== "object" || user === null) {
    return ""
  }

  if ("id" in user && typeof user.id === "string") {
    return user.id
  }

  if ("_id" in user && typeof user._id === "string") {
    return user._id
  }

  return ""
}
