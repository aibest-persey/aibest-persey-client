const GRADIENTS = [
  "linear-gradient(135deg, #1d4e89 0%, #123159 100%)",
  "linear-gradient(135deg, #7a1f2b 0%, #4d1219 100%)",
  "linear-gradient(135deg, #3f6b4d 0%, #22402c 100%)",
  "linear-gradient(135deg, #5b4e7a 0%, #362c4d 100%)",
  "linear-gradient(135deg, #8a6d3b 0%, #5c4a26 100%)",
  "linear-gradient(135deg, #3a4a5c 0%, #23303d 100%)",
]

const TILE_COLORS = ["#1d4e89", "#7a1f2b", "#3f6b4d", "#8a6d3b", "#3a4a5c", "#5b4e7a", "#4a4e69"]

function hashId(id) {
  if (!id) return 0
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff
  return hash
}

export function getGradient(id) {
  return GRADIENTS[hashId(id) % GRADIENTS.length]
}

export function getTileColor(id) {
  return TILE_COLORS[hashId(id) % TILE_COLORS.length]
}
