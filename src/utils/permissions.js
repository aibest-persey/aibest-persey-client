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

export function canAccessOrganiserDashboard(user) {
  return isOrganiser(user)
}

// club is a club-membership role ("owner" | "manager" | "member" | null),
// distinct from the account-wide user.role — see ClubDetail.jsx's getClub().
export function canManageClub(clubMyRole) {
  return clubMyRole === "owner" || clubMyRole === "manager"
}

export function canPostInClub(clubMyRole) {
  return clubMyRole !== null && clubMyRole !== undefined
}

// Matches the backend: club events can only be created by an organiser who
// also manages/owns the specific club (event-controller.ts's club-scope check).
export function canCreateClubEvent(user, clubMyRole) {
  return canManageClub(clubMyRole) && isOrganiser(user)
}

// Mirrors admin-controller.ts's "can't change your own role" guard so the
// control never looks clickable for a row the backend would reject anyway.
export function canChangeUserRole(currentUser, targetUserId) {
  return isAdmin(currentUser) && currentUser?.id !== targetUserId
}
