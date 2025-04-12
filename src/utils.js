export function id(id) {
  return document.getElementById(id)
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

// 0xRRGGBB -> [R, G, B]
export function hexToRGB(hex) {
  return [
    hex >> 16,
    (hex >> 8) & 0xff,
    hex & 0xff
  ]
}

export function rgbToHex(rgb) {
  return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2]
}

export function textToHTML(str) {
  return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>")
}
