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

function draw() {
  canvas.width = canvasW = canvasWrapper.offsetWidth * devicePixelRatio
  canvas.height = canvasH = canvasWrapper.offsetHeight * devicePixelRatio

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  offscreenCtx.putImageData(imgData, 0, 0)
  ctx.drawImage(offscreenCanvas, -cameraX, -cameraY, imgW * cameraZoom, imgH * cameraZoom)

  console.log(imgData)
}

// placeholder data (draws a TINY black square in the corner)
Promise.resolve({ json() { return { width: 3, height: 3, img: [[[1, 2, 3, 255], [5, 6, 7, 255], [9, 10, 11, 255]], [[1, 2, 3, 255], [5, 6, 7, 255], [9, 10, 11, 255]], [[1, 2, 3, 255], [5, 6, 7, 255], [9, 10, 11, 255]]] } } })
// fetch("the data")
  .then(res => res.json()).then(data => {
    imgW = data.width
    imgH = data.height

    offscreenCanvas.width = imgW
    offscreenCanvas.height = imgH

    let rawData = new Uint8ClampedArray(data.img.flat(2))
    imgData = new ImageData(rawData, imgW, imgH)

    draw()
  })
  .catch(err => {
    alert(`It didn't work :(\n\nERROR:\n${err.message}`)
  })

let colors = {
  Tomato:    "#d50000",
  Flamingo:  "#e67c73",
  Tangerine: "#f4511e",
  Banana:    "#f6bf26",
  Sage:      "#33b679",
  Basil:     "#0b8043",
  Peacock:   "#039be5",
  Blueberry: "#3f51b5",
  Lavender:  "#7986cb",
  Grape:     "#8e24aa",
  Graphite:  "#616161"
}

for (let [key, value] of Object.entries(colors)) {
  let button = document.createElement("button")
  button.classList.add("color-button")
  button.title = key
  button.style.setProperty("--color", value)
  id("color-buttons").append(button)
}
