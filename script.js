const id = id => document.getElementById(id)

const canvasWrapper = id("canvas-wrapper")
const canvas = id("canvas")
const ctx = canvas.getContext("2d")
const offscreenCanvas = document.createElement("canvas")
const offscreenCtx = offscreenCanvas.getContext("2d")

ctx.imageSmoothingEnabled = false
offscreenCtx.imageSmoothingEnabled = false

let canvasW, canvasH, imgW, imgH, imgData

let cameraX = 0, cameraY = 0, cameraZoom = 8

let mouseX = -1, mouseY = -1, drawColor

function draw() {
  canvas.width = canvasW = canvasWrapper.offsetWidth * devicePixelRatio
  canvas.height = canvasH = canvasWrapper.offsetHeight * devicePixelRatio

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  offscreenCtx.putImageData(imgData, 0, 0)
  ctx.drawImage(offscreenCanvas, -cameraX, -cameraY, imgW * cameraZoom, imgH * cameraZoom)

  console.log(imgData)
}

// placeholder data (draws a TINY black square in the corner)
Promise.resolve({ json() { return { width: 3, height: 3, img: [[0xff0000, 0xff8800, 0xffff00], [0x00ff00, 0x00ffff, 0x0000ff], [0xff00ff, 0xffffff, 0x000000]] } } })
// fetch("the data")
  .then(res => res.json()).then(data => {
    imgW = data.width
    imgH = data.height

    offscreenCanvas.width = imgW
    offscreenCanvas.height = imgH

    let rawData = new Uint8ClampedArray(imgW * imgH * 4)
    for (let y = 0; y < imgH; y++) {
      for (let x = 0; x < imgW; x++) {
        let i = (x + y * imgW) * 4
        rawData[i + 0] = data.img[y][x] >> 16
        rawData[i + 1] = (data.img[y][x] >> 8) & 0xff
        rawData[i + 2] = data.img[y][x] & 0xff
      }
    }
    imgData = new ImageData(rawData, imgW, imgH)

    draw()
  })
  .catch(err => {
    alert(`It didn't work :(\n\nERROR:\n${err.message}`)
  })

let colors = {
  "Red":         [213, 0, 0],
  "Orange":      [254, 111, 27],
  "Yellow":      [246, 191, 38],
  "Light Green": [13, 186, 86],
  "Dark Green":  [3, 144, 71],
  "Light Blue":  [3, 155, 229],
  "Dark Blue":   [44, 57, 190],
  "Purple":      [172, 48, 221],
  "Magenta":     [246, 48, 163],
  "White":       [255, 255, 255],
  "Gray":        [127, 127, 127],
  "Black":       [0, 0, 0],
  "Nueva Blue":  [0, 40, 188],
  "Nueva Lime":  [208, 243, 0]
}

for (let [name, rgb] of Object.entries(colors)) {
  let button = document.createElement("button")
  button.classList.add("color-button")
  if (name == "White") button.classList.add("white")
  button.title = name
  button.style.setProperty("--color", `rgb(${rgb})`)
  id("color-buttons").append(button)

  button.onclick = () => drawColor = rgb
}
