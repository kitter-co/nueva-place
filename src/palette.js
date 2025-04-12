import { hasCurrentColor, setCurrentColor } from "./canvas.js"
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

const colorButtonsWrapper = id("color-buttons")

function selectColor(rgb) {
  if (!hasCurrentColor()) {
    colorButtonsWrapper.style.height = colorButtonsWrapper.offsetHeight + "px"
    void colorButtonsWrapper.offsetWidth // force css recalc
    colorButtonsWrapper.classList.add("closed")
    colorButtonsWrapper.style.setProperty(
      "--selected-color",
      rgb == "255,255,255" ? "#0004" : `rgb(${rgb})`
    )
  }

  setCurrentColor(rgb)
}

function cancelColor() {
  if (hasCurrentColor()) {
    colorButtonsWrapper.classList.remove("closed")
    colorButtonsWrapper.style.removeProperty("--selected-color")
    setTimeout(() => {
      colorButtonsWrapper.style.height = ""
    }, 400)
  }

  setCurrentColor(null)
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

export { colorButtonsWrapper, cancelColor }
