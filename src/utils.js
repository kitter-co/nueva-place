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

function rgbToHex(rgb) {
  return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2]
}

function textToHTML(str) {
  return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>")
}

export { id, clamp, hexToRGB, rgbToHex, textToHTML }
