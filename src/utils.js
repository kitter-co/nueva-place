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

// [R, G, B] -> 0xRRGGBB
function rgbToHex(rgb) {
  return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2]
}

function darken(rgb) {
  return rgb == "0,0,0" ? [20, 20, 20] : rgb.map(x => x / 6)
}

// slightly different from traditional "escape" because it replaces new lines with "<br>"
function textToHTML(str) {
  return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>")
}

export { id, clamp, hexToRGB, rgbToHex, darken, textToHTML }
