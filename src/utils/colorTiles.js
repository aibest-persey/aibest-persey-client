const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
]

const TILE_COLORS = ["#5669FF", "#F0635A", "#F59762", "#29D697", "#46CDFB", "#7F77DD", "#1D9E75"]

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
