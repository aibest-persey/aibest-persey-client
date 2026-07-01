import { useState, useEffect } from "react"
import { useAuth } from "./useAuth.js"
import { listOrganisations } from "../services/organisationService.js"

// Whether the current user belongs to at least one organisation — used to
// gate the Clubs nav item/route and Home's clubs rail until they join one.
export function useHasOrganisation() {
  const { token } = useAuth()
  const [organisations, setOrganisations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    listOrganisations(token)
      .then(setOrganisations)
      .catch(() => setOrganisations([]))
      .finally(() => setLoading(false))
  }, [token])

  return {
    hasOrganisation: organisations.some((o) => o.isMember),
    organisations,
    loading,
  }
}
