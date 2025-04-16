import { clamp, id, darken } from "./utils.js"
import { cancelColor, currentColor, onCooldown } from "./palette.js"
import { placePixel } from "./server.js"
import { signedIn, email } from "./auth.js"

const canvasWrapper = id("canvas-wrapper")

const canvas = id("canvas")
const ctx = canvas.getContext("2d")

const offscreenCanvas = document.createElement("canvas")
const offscreenCtx = offscreenCanvas.getContext("2d")

offscreenCtx.imageSmoothingEnabled = false

let canvasW, canvasH, imgW, imgH, imgData, userImgData, users

const MIN_ZOOM = 1, MAX_ZOOM = 4.5 // these are "raw zoom" values, rawZoom = ln(zoom)
let cameraX = 0, cameraY = 0, rawZoom = 2, zoom = Math.exp(rawZoom)

let userHighlight = false

function updateZoom() {
  let oldZoom = zoom
  rawZoom = clamp(rawZoom, MIN_ZOOM, MAX_ZOOM)
  zoom = Math.exp(rawZoom)
  cameraX += mouseX / oldZoom - mouseX / zoom
  cameraY += mouseY / oldZoom - mouseY / zoom
}

function getViewportDataArray() {
  return [
    cameraX + innerWidth / zoom / 2,
    cameraY + innerHeight / zoom / 2,
    innerWidth / zoom,
    innerHeight / zoom
  ].map(x => Math.round(x * 1e5) / 1e5)
}

function loadViewportDataArray([x, y, zx, zy]) {
  let zoom = Math.min(innerWidth / zx, innerHeight / zy)
  rawZoom = Math.log(zoom)
  updateZoom()

  cameraX = x - innerWidth / zoom / 2
  cameraY = y - innerHeight / zoom / 2
}

let mouseX = null, mouseY = null, targetX = null, targetY = null

function setSize(width, height) {
  offscreenCanvas.width = imgW = width
  offscreenCanvas.height = imgH = height
}

function setData(data, usersData) {
  imgData = data
  users = usersData

  updateUserPixels()
}

function updateUserPixels() {
  if (userImgData || !imgData || !email) return

  let rawData = new Uint8ClampedArray(imgW * imgH * 4)

  for (let y = 0; y < imgH; y++) {
    for (let x = 0; x < imgW; x++) {
      let rgb = getPixel(x, y)
      let user = users[y][x]

      let i = imgDataIndex(x, y)

      if (user == email) {
        rawData.set(rgb, i)
      } else {
        rawData.set(darken(rgb), i)
      }

      rawData[i + 3] = 255
    }
  }

  userImgData = new ImageData(rawData, imgW, imgH)
}

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
  return [...imgData.data.subarray(i, i + 3)]
}

function setPixel(x, y, rgb, user) {
  let i = imgDataIndex(x, y)

  imgData.data.set(rgb, i)
  users[y][x] = user

  if (userImgData) {
    if (user == email) {
      userImgData.data.set(rgb, i)
    } else {
      userImgData.data.set(darken(rgb), i)
    }
  }
}

function toggleHighlight() {
  return userHighlight = !userHighlight
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

  offscreenCtx.putImageData(userHighlight ? userImgData : imgData, 0, 0)

  ctx.drawImage(offscreenCanvas, -cameraX * zoom, -cameraY * zoom, imgW * zoom, imgH * zoom)

  if (canPlace() && !draggingCamera) {
    if (inBounds()) {
      ctx.beginPath()
      ctx.rect((targetX - cameraX) * zoom, (targetY - cameraY) * zoom, zoom, zoom)
      ctx.strokeStyle = currentColor == "0,0,0" ? "#333" : `rgb(${currentColor})`
      ctx.lineWidth = clamp(zoom / 20, 1, 3)
      ctx.stroke()
      ctx.fillStyle = currentColor == "255,255,255" ? "rgba(221, 221, 221, 0.4)" : `rgba(${currentColor},0.1)`
      ctx.fill()
    }

    canvas.style.cursor = "crosshair"
  } else {
    canvas.style.cursor = draggingCamera ? "grabbing" : "grab"
  }
}

function download() {
  offscreenCanvas.toBlob(blob => {
    let link = document.createElement("a")
    link.download = `nueva-place_${new Date().toDateString().slice(4).replaceAll(" ", "-")}.png`
    link.href = URL.createObjectURL(blob)
    link.click()
  })
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

let lastTouchDist = null

function getEventPos(e) {
  return e.touches ? e.touches[0] : e
}

function touchDist(e) {
  let dx = e.touches[0].clientX - e.touches[1].clientX
  let dy = e.touches[0].clientY - e.touches[1].clientY
  return Math.hypot(dx, dy)
}

function updateInteractionStart(e) {
  updateMousePos(getEventPos(e))

  if (e.type === "touchstart") {
    if (e.touches.length === 2) {
      lastTouchDist = touchDist(e)
    } else {
      draggingCamera = true
    }
  } else if (e.type === "mousedown" && (!currentColor || !inBounds())) {
    draggingCamera = true
  }
}

function updateInteractionMove(e) {
  if (e.touches && e.touches.length === 2) {
    let dist = touchDist(e)

    if (lastTouchDist !== null) {
      rawZoom += (dist - lastTouchDist) * 0.005
      updateZoom()
    }

    lastTouchDist = dist
    e.preventDefault()
    return
  }

  lastTouchDist = null

  let lastX = mouseX, lastY = mouseY
  updateMousePos(getEventPos(e))

  if (draggingCamera) {
    cameraX -= (mouseX - lastX) / zoom
    cameraY -= (mouseY - lastY) / zoom
  }

  if (e.type === "touchmove") {
    e.preventDefault()
  }
}

function updateInteractionEnd() {
  draggingCamera = false
  lastTouchDist = null
}

canvas.addEventListener("mousedown", updateInteractionStart)
canvas.addEventListener("touchstart", updateInteractionStart, { passive: false })

window.addEventListener("mousemove", updateInteractionMove)
window.addEventListener("touchmove", updateInteractionMove, { passive: false })

window.addEventListener("mouseup", updateInteractionEnd)
window.addEventListener("touchend", updateInteractionEnd)

canvas.addEventListener("click", e => {
  if (!draggingCamera) {
    updateMousePos(e)
    attemptPlacePixel()
  }
})

canvas.onwheel = e => {
  if (e.ctrlKey) {
    e.preventDefault()
    rawZoom -= e.deltaY * 0.015
  } else {
    rawZoom -= e.deltaY * 0.002
  }
  updateZoom()
}

onkeydown = e => {
  if (e.code === "Escape") {
    cancelColor()
    id("account-menu").classList.remove("shown")
  }
}

onkeydown = e => {
  if (e.code === "Escape") {
    cancelColor()
    id("account-menu").classList.remove("shown")
  }
}

export {
  getViewportDataArray,
  loadViewportDataArray,
  setSize,
  setData,
  updateUserPixels,
  imgDataIndex,
  getPixel,
  setPixel,
  toggleHighlight,
  draw,
  download,
  canvas,
  mouseX,
  mouseY
}
