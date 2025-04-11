function id(id) {
  return document.getElementById(id)
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

// 0xRRGGBB -> [R, G, B]
function hexToRGB(hex) {
  return [
    hex >> 16,
    (hex >> 8) & 0xff,
    hex & 0xff
  ]
}

export { id, clamp, hexToRGB }
