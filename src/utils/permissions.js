// Centralizes "can the current user do X" checks that were previously
// scattered as inline `user?.role === "..."` comparisons across pages. The
// backend is the source of truth and re-checks every one of these on every
// request — this module only decides what to show, never what to allow.

export function isAdmin(user) {
  return user?.role === "admin"
}

export function isOrganiser(user) {
  return user?.role === "organiser"
}

export function isStudent(user) {
  return user?.role === "student"
}

export function canAccessAdminDashboard(user) {
  return isAdmin(user)
}

// Shared by club and organisation membership roles — both use the same
// "owner" | "manager" | "member" enum server-side.
function isOwnerOrManager(myRole) {
  return myRole === "owner" || myRole === "manager"
}

// club is a club-membership role ("owner" | "manager" | "member" | null),
// distinct from the account-wide user.role — see ClubDetail.jsx's getClub().
export function canManageClub(clubMyRole) {
  return isOwnerOrManager(clubMyRole)
}

// org is an organisation-membership role, same shape as clubMyRole above —
// see OrganiserDashboard.jsx's listOrganisations()/myRole field. Note this is
// the *role* only — it doesn't know about a Teacher grant, which needs the
// fuller membership record (see getOrgMembership below).
export function canManageOrganisation(orgMyRole) {
  return isOwnerOrManager(orgMyRole)
}

export function canPostInClub(clubMyRole) {
  return clubMyRole !== null && clubMyRole !== undefined
}

// Club events are gated purely by club role (owner/manager), regardless of the
// creator's platform role — a platform-role student who owns their club can
// create events for it (event-controller.ts's club-scope check, can()'s
// "club:event:create" action). Do not re-add an isOrganiser() requirement here.
export function canCreateClubEvent(clubMyRole) {
  return canManageClub(clubMyRole)
}

// --- Effective org permissions, sourced from /me's organisationMemberships ---
// (role + isTeacher + permissions per org, refreshed every session sync — see
// auth-controller.ts's `me` handler). Resource endpoints like listOrganisations
// only project the plain `role` string, not the Teacher grant, so anything that
// needs to account for a Teacher's specific permissions must cross-reference
// this list instead of trusting a resource's own `myRole` field.

export function getOrgMembership(user, organisationId) {
  return (user?.organisationMemberships ?? []).find((m) => m.organisationId === organisationId) ?? null
}

function hasOrgTeacherGrant(user, organisationId, permissionKey) {
  const membership = getOrgMembership(user, organisationId)
  return Boolean(membership?.isTeacher && membership?.permissions?.[permissionKey])
}

// Whether the user manages (owner/manager) or has a member-management Teacher
// grant on at least one organisation — used to decide whether org-management
// surfaces (the Organiser Dashboard's Organisations tab) are worth showing at
// all, independent of platform role.
export function managesAnyOrganisation(user) {
  return (user?.organisationMemberships ?? []).some(
    (m) => isOwnerOrManager(m.role) || (m.isTeacher && m.permissions?.canManageMembers)
  )
}

// Join-request review / member add-remove: owner/manager, or a Teacher with
// the canManageMembers grant (can()'s "organisation:member:add" action).
export function canManageOrgMembers(user, organisationId, orgMyRole) {
  return isOwnerOrManager(orgMyRole) || hasOrgTeacherGrant(user, organisationId, "canManageMembers")
}

// Access to the Organiser Dashboard route/nav item: platform-role organiser
// (who can create public events there), OR anyone with effective management
// rights over at least one org (owner/manager, or Teacher w/ canManageMembers)
// even if their platform role is still "student". Distinct from the public
// event-create button inside that page, which stays isOrganiser()-only — see
// OrganiserDashboard.jsx.
export function canAccessOrganiserDashboard(user) {
  return isOrganiser(user) || managesAnyOrganisation(user)
}

// Mirrors admin-controller.ts's "can't change your own role" guard so the
// control never looks clickable for a row the backend would reject anyway.
export function canChangeUserRole(currentUser, targetUserId) {
  return isAdmin(currentUser) && currentUser?.id !== targetUserId
}
