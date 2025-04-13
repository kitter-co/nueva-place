import { id } from "./utils.js"

const colors = {
  "Red":         [213, 0, 0],
  "Orange":      [254, 111, 27],
  "Yellow":      [255, 207, 38],
  "Light Green": [8, 214, 72],
  "Dark Green":  [0, 123, 42],
  "Light Blue":  [3, 155, 229],
  "Dark Blue":   [44, 57, 190],
  "Purple":      [172, 48, 221],
  "Pink":        [255, 68, 173],
  "White":       [255, 255, 255],
  "Light Gray":  [200, 200, 200],
  "Dark Gray":   [100, 100, 100],
  "Black":       [0, 0, 0],
  "Brown":       [153, 80, 51],
}

let currentColor = null, onCooldown = false

function clearCurrentColor() {
  currentColor = null
}

const colorButtonsWrapper = id("color-buttons")

function selectColor(rgb) {
  if (!currentColor) {
    colorButtonsWrapper.style.height = colorButtonsWrapper.offsetHeight + "px"
    void colorButtonsWrapper.offsetWidth // force css recalc
    colorButtonsWrapper.classList.add("closed")
    colorButtonsWrapper.style.setProperty(
      "--selected-color",
      rgb == "255,255,255" ? "#0004" : `rgb(${rgb})`
    )
  }

  currentColor = rgb
}

function cancelColor() {
  if (currentColor) {
    colorButtonsWrapper.classList.remove("closed")
    setTimeout(() => {
      colorButtonsWrapper.style.height = ""
    }, 400)
  }

  currentColor = null
}

for (let [name, rgb] of Object.entries(colors)) {
  let button = document.createElement("button")
  button.classList.add("color-button")
  if (name === "White") button.classList.add("white")
  button.title = name
  button.style.setProperty("--color", `rgb(${rgb})`)
  colorButtonsWrapper.append(button)

  button.onclick = () => {
    selectColor(rgb)
  }
}

id("exit-place-mode").onclick = cancelColor

function startCooldown(timestamp = Math.floor(Date.now() / 1000)) {
  onCooldown = true

  colorButtonsWrapper.classList.add("cooldown")

  const elapsed = Math.floor(Date.now() / 1000) - timestamp
  id("cooldown").style.animationDelay = `-${elapsed}s`
}

function endCooldown() {
  onCooldown = false

  colorButtonsWrapper.classList.remove("cooldown")
  colorButtonsWrapper.style.height = ""
}

export {
  colorButtonsWrapper,
  currentColor,
  clearCurrentColor,
  cancelColor,
  startCooldown,
  endCooldown,
  onCooldown
}
