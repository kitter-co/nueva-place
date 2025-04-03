// UTILS

const id = id => document.getElementById(id)

// CANVAS

const canvasWrapper = id("canvas-wrapper")
const canvas = id("canvas")
const ctx = canvas.getContext("2d")
const offscreenCanvas = document.createElement("canvas")
const offscreenCtx = offscreenCanvas.getContext("2d")

offscreenCtx.imageSmoothingEnabled = false

let signedIn = true, onCooldown = false, lastEdit = 0

let canvasW, canvasH, imgW, imgH, imgData

let cameraX = 0, cameraY = 0, rawZoom = 3, zoom = 2 ** rawZoom

let mouseX = null, mouseY = null, targetX = null, targetY = null, currentColor = null

function canPlace() {
  return signedIn && !onCooldown && currentColor
}

function updateMousePos(e) {
  let rect = canvas.getBoundingClientRect()

  mouseX = e.pageX
  mouseY = e.pageY

  if (e.target === canvas) {
    targetX = Math.floor((mouseX - rect.left) / zoom + cameraX)
    targetY = Math.floor((mouseY - rect.top ) / zoom + cameraY)
  } else {
    targetX = targetY = null
  }
}

function setPixel(x, y, rgb) {
  let i = (x + y * imgW) * 4

  imgData.data[i + 0] = rgb[0]
  imgData.data[i + 1] = rgb[1]
  imgData.data[i + 2] = rgb[2]
}

function draw() {
  requestAnimationFrame(draw)

  canvas.width = canvasW = canvasWrapper.offsetWidth * devicePixelRatio
  canvas.height = canvasH = canvasWrapper.offsetHeight * devicePixelRatio
  ctx.scale(devicePixelRatio, devicePixelRatio)
  ctx.imageSmoothingEnabled = false

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  offscreenCtx.putImageData(imgData, 0, 0)
  ctx.drawImage(offscreenCanvas, -cameraX * zoom, -cameraY * zoom, imgW * zoom, imgH * zoom)

  if (canPlace() && targetX !== null && targetY !== null && !draggingCamera) {
    ctx.beginPath()
    ctx.rect((targetX - cameraX) * zoom, (targetY - cameraY) * zoom, zoom, zoom)
    ctx.strokeStyle = currentColor == "0,0,0" ? "#333" : `rgb(${currentColor})`
    ctx.stroke()
    ctx.fillStyle = "#4442"
    ctx.fill()

    canvas.style.cursor = "crosshair"
  } else {
    canvas.style.cursor = "default"
  }
}

function attemptPlacePixel() {
  if (!canPlace() || !inBounds()) return

  sendPlaceRequest(targetX, targetY, (currentColor[0] << 16) | (currentColor[1] << 8) | currentColor[2])
  setPixel(targetX, targetY, currentColor) // TODO undo if server request fails
}

function inBounds() {
  return targetX !== null && targetY !== null && targetX >= 0 && targetX < imgW && targetY >= 0 && targetY < imgH
}

let draggingCamera = false

canvas.onmousedown = e => {
  if (!currentColor || !inBounds()) {
    draggingCamera = true
  }
}

canvas.onclick = e => {
  updateMousePos(e)
  if (!draggingCamera) attemptPlacePixel()
}

onmouseup = e => {
  updateMousePos(e)
  draggingCamera = false
}

onmousemove = e => {
  let lastX = mouseX, lastY = mouseY

  updateMousePos(e)

  if (draggingCamera) {
    cameraX -= (mouseX - lastX) / zoom
    cameraY -= (mouseY - lastY) / zoom
  }
}

canvas.onwheel = e => {
  if (e.ctrlKey) {
    e.preventDefault()
    rawZoom -= e.deltaY * 0.015
  } else {
    rawZoom -= e.deltaY * 0.005
  }

  let oldZoom = zoom
  zoom = 2 ** rawZoom
  // TODO fix this - it kinda works most of the time but its super janky
  cameraX += (mouseX + cameraX) * (zoom - oldZoom) / oldZoom / zoom
  cameraY += (mouseY + cameraY) * (zoom - oldZoom) / oldZoom / zoom
}

onkeydown = e => {
  if (e.code === "Escape") {
    cancelColor()
  }
}

// SERVÍR

function sendPlaceRequest(x, y, hex) {
  // TODO
}

// TODO placeholder data
Promise.resolve({ json() { return { width: 10, height: 5, img: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] } } })
// fetch("the data")
  .catch(err => {
    alert(`It didn't work :(\n\nERROR:\n${err.message}`)
  })
  .then(res => res.json()).then(data => {
    imgW = data.width
    imgH = data.height

    offscreenCanvas.width = imgW
    offscreenCanvas.height = imgH

    let rawData = new Uint8ClampedArray(imgW * imgH * 4)
    for (let y = 0; y < imgH; y++) {
      for (let x = 0; x < imgW; x++) {
        let i = (x + y * imgW) * 4, hex = data.img[y][x]

        rawData[i + 0] = hex >> 16
        rawData[i + 1] = (hex >> 8) & 0xff
        rawData[i + 2] = hex & 0xff
        rawData[i + 3] = 255
      }
    }
    imgData = new ImageData(rawData, imgW, imgH)

    draw()
  })

// COLOR PALETTE

const colors = {
  "Red":         [213, 0, 0],
  "Orange":      [254, 111, 27],
  "Yellow":      [246, 191, 38],
  "Light Green": [8, 214, 95],
  "Dark Green":  [0, 123, 42],
  "Light Blue":  [3, 155, 229],
  "Dark Blue":   [44, 57, 190],
  "Purple":      [172, 48, 221],
  "Magenta":     [246, 48, 163],
  "White":       [255, 255, 255],
  "Gray":        [160, 160, 160],
  "Black":       [0, 0, 0]
}

const colorButtonsWrapper = id("color-buttons")

function selectColor(rgb) {
  if (!currentColor) {
    colorButtonsWrapper.style.height = colorButtonsWrapper.offsetHeight + "px"
    void colorButtonsWrapper.offsetWidth // force css recalc
    colorButtonsWrapper.classList.add("closed")
    colorButtonsWrapper.style.setProperty("--selected-color", `rgb(${rgb})`)
  }

  currentColor = rgb
}

function cancelColor() {
  if (currentColor) {
    colorButtonsWrapper.classList.remove("closed")
    colorButtonsWrapper.style.removeProperty("--selected-color")
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
