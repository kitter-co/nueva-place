import {
  setSize,
  setData,
  imgDataIndex,
  setPixel,
  draw, loadViewportDataArray
} from "./canvas.js"

import { errorToast, toast } from "./toast.js"
import { id, hexToRGB, rgbToHex } from "./utils.js"
import { clearCurrentColor, endCooldown, startCooldown } from "./palette.js"
import { email } from "./auth.js"

const AUTH = '5609854b-4c67-43f1-8d36-4967322f1074'
const socket = new WebSocket(`wss://api.nueva.place/?auth=${AUTH}`)

let queue = []

socket.onmessage = (event) => interpret(event.data)

socket.onopen = () => {
  for (let payload of queue) {
    socket.send(payload)
  }
}

socket.onerror = () => {
  toast("Failed to connect to server.\nWait a minute, then reload the page and try again.", true)
}

let loaded = false

function interpret(data) {
  const msg  = JSON.parse(data)
  const body = JSON.parse(msg.body)

  switch (msg.type) {
    case "pixels":
      receivedFullUpdate(body[0].length, body.length, body)
      if (!loaded) {
        loaded = true
        id("canvas").style.animation = "fade-in 0.2s ease-out forwards"

        draw(true)
        if (location.search) {
          let viewportData = location.search.slice(1).split(",").map(Number)
          if (viewportData.length === 4 && !viewportData.some(isNaN)) {
            loadViewportDataArray(viewportData)
          } else {
            toast("Invalid viewport data in URL", true)
          }
        }
      }

      break

    case "update":
      receivedPixelUpdate(body.x, body.y, body.color, body.user)
      break

    case "cooldown": {
      const elapsed = Date.now() / 1000 - body

      if (elapsed < 0.1 * 60) {
        startCooldown(body)
        setTimeout(endCooldown, (0.1 * 60 - elapsed) * 1000)
      }

      break
    }

    case "error":
      errorToast(body)
      break
  }
}

function send(type, body) {
  const payload = JSON.stringify({
    type,
    body: JSON.stringify(body)
  })

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(payload)
  } else {
    queue.push(payload)
  }
}

function validateToken(token) {
  send("token", token)
}

function updatePixel(x, y, color) {
  send("update", { x, y, color })
}

function placePixel(x, y, rgb) {
  setPixel(x, y, rgb, email)
  clearCurrentColor()

  let hex = rgbToHex(rgb)
  updatePixel(x, y, hex)

  const colorButtonsWrapper = id("color-buttons")

  colorButtonsWrapper.classList.remove("closed")
}

function receivedPixelUpdate(x, y, hex, user) {
  setPixel(x, y, hexToRGB(hex), user)
}

function receivedFullUpdate(width, height, data) {
  setSize(width, height)

  let rawData = new Uint8ClampedArray(width * height * 4)
  let users = Array.from({ length: height }, () => Array(width))

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let pixel = data[y][x]

      let i = imgDataIndex(x, y)

      rawData.set(hexToRGB(pixel.color), i)
      rawData[i + 3] = 255

      users[y][x] = pixel.user
    }
  }

  setData(new ImageData(rawData, width, height), users)
}

export { validateToken, placePixel }
