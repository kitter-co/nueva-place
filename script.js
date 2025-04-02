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
