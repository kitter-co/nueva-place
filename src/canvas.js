import { id, clamp } from "./utils.js"
import { toast } from "./toast.js"
import { colorButtonsWrapper, cancelColor } from "./palette.js"
import { placePixel } from "./server.js"
import { isSignedIn } from "./auth.js"

const canvasWrapper = id("canvas-wrapper")
const canvas = id("canvas")
const ctx = canvas.getContext("2d")
const offscreenCanvas = document.createElement("canvas")
const offscreenCtx = offscreenCanvas.getContext("2d")

offscreenCtx.imageSmoothingEnabled = false

let onCooldown = false, lastEditTime

let canvasW, canvasH, imgW, imgH, imgData

const MIN_ZOOM = 1, MAX_ZOOM = 4.5 // these are "raw zoom" values, rawZoom = ln(zoom)
let cameraX = 0, cameraY = 0, rawZoom = 3, zoom = Math.exp(rawZoom)

let mouseX = null, mouseY = null, targetX = null, targetY = null, currentColor = null

function setSize(width, height) {
  offscreenCanvas.width = imgW = width
  offscreenCanvas.height = imgH = height
}

function setData(data) {
  imgData = data
}

function hasCurrentColor() {
  return !!currentColor
}

function setCurrentColor(color) {
  currentColor = color
}

function canPlace() {
  return isSignedIn() && !onCooldown && currentColor
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

  colorButtonsWrapper.classList.add("disable-transitions")
  colorButtonsWrapper.classList.remove("closed")
  colorButtonsWrapper.style.removeProperty("--selected-color")
  colorButtonsWrapper.style.height = ""
  void colorButtonsWrapper.offsetWidth // force css recalc
  colorButtonsWrapper.classList.remove("disable-transitions")
  colorButtonsWrapper.classList.remove("hidden")
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

canvas.oncontextmenu = e => {
  e.preventDefault()
  openContextMenu(
    e.clientX,
    e.clientY,
    0, // sam: pass in the coords of the pixel you're clicking on/closest to
    0
  )
}

document.addEventListener("mousedown", e => {
  if (e.button != 2 && e.target != id("context-menu") && !id("context-menu").contains(e.target) && e.target != id("context-menu-button") && !id("context-menu-button").contains(e.target)) {
    closeContextMenu()
  }
})

let contextMenuOpen = false

id("context-menu").oncontextmenu = e => {
  if (!contextMenuOpen) {
    e.preventDefault()
  }
}

function openContextMenu(mouseX, mouseY, pixelX, pixelY, button = false) {
  setTimeout(() => {
    if (button) {
      id("context-menu-button").classList.add("selected")
      contextMenuOpen = true
      id("context-menu").style.left = ""
      id("context-menu").style.right = innerWidth - id("context-menu-button").getBoundingClientRect().right + "px"

      setTimeout(() => {
        if (id("context-menu-button").getBoundingClientRect().left < 10) {
          id("context-menu").style.right = ""
          id("context-menu").style.left = "10px"
        }
      }, 0)
    } else {
      id("context-menu").style.right = ""
      id("context-menu").style.left = mouseX + "px"
      contextMenuOpen = false
    }
    id("context-menu").style.top = mouseY + "px"

    id("copy-location").dataset.pixelX = pixelX
    id("copy-location").dataset.pixelY = pixelY
    id("context-menu").style.display = "flex"

    id("context-menu").style.height = ""

    setTimeout(() => {
      id("context-menu").classList.add("shown")

      id("context-menu").animate(
        [
          { transform: "translateY(-10px)" },
          { transform: "translateY(0)" }
        ],
        {
          duration: 200,
          easing: "ease",
          fill: "forwards"
        }
      )

      id("context-menu").animate(
        [
          { opacity: 0 },
          { opacity: 1 }
        ],
        {
          duration: 100,
          easing: "linear",
          fill: "forwards"
        }
      )
    }, 0)
  }, 0)
}

id("context-menu-button").onclick = () => {
  if (contextMenuOpen) {
    closeContextMenu()
  } else {
    openContextMenu(60, 60, 0, 0, true) // sam: for mobile choose the center of the view cause you have no mouse
  }
}

function closeContextMenu() {
  id("context-menu-button").classList.remove("selected")
  contextMenuOpen = false
  id("context-menu").classList.remove("shown")
  id("context-menu").animate(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(-10px)" }
    ],
    {
      duration: 200,
      easing: "ease",
      fill: "forwards"
    }
  )
  id("context-menu").animate(
    [
      { opacity: 1 },
      { opacity: 0 }
    ],
    {
      duration: 100,
      easing: "linear",
      fill: "forwards"
    }
  )
  setTimeout(() => {
    id("context-menu").style.display = "none"
    id("context-menu").style.height = 0
  }, 200)
}

id("download-image").onclick = () => {
  // sam: can you make this download it at full scale please?
  var link = document.createElement("a")
  link.download = "nueva_place.png"
  link.href = canvas.toDataURL()
  link.click()
  closeContextMenu()
}

closeContextMenu()

id("copy-location").onclick = () => {
  // sam: can you make the canvas center around a certain set of pixel coords if there's ?coords=x,y?
  navigator.clipboard.writeText(`https://nueva.place/?coords=${id("copy-location").dataset.pixelX},${id("copy-location").dataset.pixelY}`)
  toast("Location Copied!")
  closeContextMenu()
}

let lastTouchDist = null

function getEventPos(e) {
  return e.touches ? e.touches[0] : e
}

function updateInteractionStart(e) {
  let pos = getEventPos(e)
  updateMousePos(pos)

  if (e.type === "touchstart") {
    if (e.touches.length === 2) {
      let dx = e.touches[0].clientX - e.touches[1].clientX
      let dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist = Math.sqrt(dx * dx + dy * dy)
    } else {
      draggingCamera = true
    }
  } else if (e.type === "mousedown") {
    draggingCamera = true
  }

  if (!draggingCamera) {
    attemptPlacePixel()
  }
}

function updateInteractionMove(e) {
  if (e.touches && e.touches.length === 2) {
    let dx = e.touches[0].clientX - e.touches[1].clientX
    let dy = e.touches[0].clientY - e.touches[1].clientY
    let dist = Math.sqrt(dx * dx + dy * dy)

    if (lastTouchDist !== null) {
      let delta = dist - lastTouchDist
      rawZoom += delta * 0.005

      let oldZoom = zoom
      rawZoom = clamp(rawZoom, MIN_ZOOM, MAX_ZOOM)
      zoom = Math.exp(rawZoom)

      cameraX += mouseX / oldZoom - mouseX / zoom
      cameraY += mouseY / oldZoom - mouseY / zoom
    }

    lastTouchDist = dist
    e.preventDefault()
    return
  }

  lastTouchDist = null

  let pos = getEventPos(e)
  let lastX = mouseX, lastY = mouseY

  updateMousePos(pos)

  if (draggingCamera) {
    cameraX -= (mouseX - lastX) / zoom
    cameraY -= (mouseY - lastY) / zoom
  }

  if (e.type === "touchmove") {
    e.preventDefault()
  }
}

function updateInteractionEnd(e) {
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

onkeydown = e => {
  if (e.code === "Escape") {
    cancelColor()
    id("account-menu").classList.remove("shown")
  }
}

export {
  setSize,
  setData,
  hasCurrentColor,
  setCurrentColor,
  imgDataIndex,
  getPixel,
  setPixel,
  draw,
  startCooldown,
  endCooldown
}
