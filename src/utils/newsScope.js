// Shared across every surface that renders a News item's scope badge
// (News.jsx, NewsDetail.jsx, Home.jsx, Clubs.jsx) — keep these in sync with
// the backend's News.scope enum ("public" | "org" | "club").
export const SCOPE_LABELS = { public: "Public", org: "My Org", club: "My Clubs" }
