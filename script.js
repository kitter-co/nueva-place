onload = () => {
  document.body.classList.remove("disable-transitions")
}

// UTILS

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

// CANVAS

const canvasWrapper = id("canvas-wrapper")
const canvas = id("canvas")
const ctx = canvas.getContext("2d")
const offscreenCanvas = document.createElement("canvas")
const offscreenCtx = offscreenCanvas.getContext("2d")

offscreenCtx.imageSmoothingEnabled = false

let signedIn = false, onCooldown = false, lastEditTime

let canvasW, canvasH, imgW, imgH, imgData

const MIN_ZOOM = 1, MAX_ZOOM = 4.5 // these are "raw zoom" values, rawZoom = ln(zoom)
let cameraX = 0, cameraY = 0, rawZoom = 3, zoom = Math.exp(rawZoom)

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

function imgDataIndex(x, y) {
  return (x + y * imgW) * 4
}

function getPixel(x, y) {
  let i = imgDataIndex(x, y)
  return [...imgData.data.subarray(i, i + 2)]
}

function setPixel(x, y, rgb) {
  imgData.data.set(rgb, imgDataIndex(x, y))
}

function draw(init = false) {
  requestAnimationFrame(() => draw())

  canvasW = canvasWrapper.offsetWidth
  canvasH = canvasWrapper.offsetHeight
  canvas.width = canvasW * devicePixelRatio
  canvas.height = canvasH * devicePixelRatio
  ctx.scale(devicePixelRatio, devicePixelRatio)

  if (init) {
    cameraX = (imgW - canvasW / zoom) / 2
    cameraY = (imgH - canvasH / zoom) / 2
  }

  ctx.imageSmoothingEnabled = false

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  offscreenCtx.putImageData(imgData, 0, 0)
  ctx.drawImage(offscreenCanvas, -cameraX * zoom, -cameraY * zoom, imgW * zoom, imgH * zoom)

  if (canPlace() && !draggingCamera) {
    if (inBounds()) {
      ctx.beginPath()
      ctx.rect((targetX - cameraX) * zoom, (targetY - cameraY) * zoom, zoom, zoom)
      ctx.strokeStyle = currentColor == "0,0,0" ? "#333" : `rgb(${currentColor})`
      ctx.lineWidth = clamp(zoom / 20, 1, 2)
      ctx.stroke()
      ctx.fillStyle = "#4442"
      ctx.fill()
    }

    canvas.style.cursor = "crosshair"
  } else {
    canvas.style.cursor = draggingCamera ? "grabbing" : "grab"
  }
}

function startCooldown() {
  onCooldown = true
  colorButtonsWrapper.classList.add("hidden")
  currentColor = null
}

function endCooldown() {
  onCooldown = false
  colorButtonsWrapper.classList.remove("hidden", "closed")
  colorButtonsWrapper.style.removeProperty("--selected-color")
  colorButtonsWrapper.style.height = ""
}

function attemptPlacePixel() {
  if (canPlace() && inBounds()) {
    placePixel(targetX, targetY, currentColor)
  }
}

function inBounds() {
  return targetX !== null && targetY !== null && targetX >= 0 && targetX < imgW && targetY >= 0 && targetY < imgH
}

let draggingCamera = false

canvas.onmousedown = e => {
  updateMousePos(e)
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
  rawZoom = clamp(rawZoom, MIN_ZOOM, MAX_ZOOM)
  zoom = Math.exp(rawZoom)
  cameraX += mouseX / oldZoom - mouseX / zoom
  cameraY += mouseY / oldZoom - mouseY / zoom
}

onkeydown = e => {
  if (e.code === "Escape") {
    cancelColor()
    id("account-menu").classList.remove("shown")
  }
}

// SERVÍR

function placePixel(x, y, rgb) {
  let oldRGB = getPixel(x, y), placeTime = performance.now()

  setPixel(x, y, rgb)
  startCooldown()

  let hex = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2]
  Promise.resolve() // TODO replace with actual server request
    .catch(() => {
      setTimeout(() => {
        errorToast("Oh no!\nLooks like there was an error trying to place your pixel. Wait a minute, then try again.")
        endCooldown()
        setPixel(x, y, oldRGB)
        // wait at least half a second before showing the error message
      }, placeTime - performance.now() + 500)
    })
}

function receivedPixelUpdate(x, y, hex) {
  setPixel(x, y, hexToRGB(hex))
}

function receivedFullUpdate(width, height, data) {
  offscreenCanvas.width = imgW = width
  offscreenCanvas.height = imgH = height

  let rawData = new Uint8ClampedArray(imgW * imgH * 4)
  for (let y = 0; y < imgH; y++) {
    for (let x = 0; x < imgW; x++) {
      let i = imgDataIndex(x, y)
      rawData.set(hexToRGB(data[y][x]), i)
      rawData[i + 3] = 255
    }
  }
  imgData = new ImageData(rawData, imgW, imgH)
}

// TODO placeholder data
Promise.resolve({ json() { return { width: 10, height: 5, img: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] } } })
// fetch("the data")
  .catch(err => {
    alert(`It didn't work :(\n\nERROR:\n${err.message}`)
  })
  .then(res => res.json()).then(data => {
    receivedFullUpdate(data.width, data.height, data.img)
    draw(true)
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
  "Pink":        [255, 68, 173],
  "White":       [255, 255, 255],
  "Light Gray":  [200, 200, 200],
  "Dark Gray":   [100, 100, 100],
  "Black":       [0, 0, 0],
  "Brown":       [153, 80, 51],
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

// ACCOUNTS

function signInSuccess(email, img) {
  id("account-email").innerText = email
  id("profile-img").style.display = "flex"
  id("profile-img").innerHTML = `<img src="${img}">`
  id("sign-in").remove()
  colorButtonsWrapper.classList.remove("hidden")
  signedIn = true
}

id("profile-img").onclick = () => {
  id("account-menu").classList.toggle("shown")
  id("profile-img").classList.toggle("menu-shown")
}

document.onmousedown = e => {
  if (!id("profile-img").contains(e.target) && !id("account-menu").contains(e.target)) {
    id("account-menu").classList.remove("shown")
    id("profile-img").classList.remove("menu-shown")
  }
}

// ERROR TOAST

const errorToastElem = id("error-toast")
let toastHideTimeout

function errorToast(msg = "Something went wrong :(", bug = false) {
  errorToastElem.innerText = msg + (bug ? "\n\n(You found a bug! 🎉)" : "")

  clearTimeout(toastHideTimeout)
  // force the transition to play again even if it is already shown
  errorToastElem.classList.remove("shown")
  errorToastElem.style.transition = "none"
  void errorToastElem.offsetWidth // force css recalc
  errorToastElem.style.transition = ""
  errorToastElem.classList.add("shown")

  toastHideTimeout = setTimeout(() => errorToastElem.classList.remove("shown"), 5000)
}
