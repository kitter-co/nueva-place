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

const HOST = "localhost:3000" // TODO change
const socket = new WebSocket(`ws://${HOST}`)

let queue = []

socket.onmessage = (event) => interpret(event.data)

socket.onopen = () => {
  for (let payload of queue) {
    socket.send(payload)
  }
}

socket.onerror = () => {
  toast("Failed to connect to server.\nYou are currently viewing PLACEHOLDER DATA.", true)

  // TODO remove - for testing purposes only
  interpret(
    JSON.stringify({
      type: "pixels",
      body: JSON.stringify(
        Array.from({length: 25}, () => Array.from({length: 25}, () => Math.floor(Math.random() * 0x1000000)))
      )
    })
  )
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

        draw(true)
        if (location.hash) {
          let viewportData = location.hash.slice(1).split(",").map(Number)
          if (viewportData.length === 4 && !viewportData.some(isNaN)) {
            loadViewportDataArray(viewportData)
          } else {
            toast("Invalid viewport data in URL", true)
          }
        }
      }

      break

    case "update":
      receivedPixelUpdate(body.x, body.y, body.color)
      break

    case "cooldown": {
      const elapsed = Math.floor(Date.now() / 1000) - body

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
  // let oldRGB = getPixel(x, y), placeTime = performance.now()

  setPixel(x, y, rgb)
  startCooldown()
  clearCurrentColor()

  let hex = rgbToHex(rgb)
  updatePixel(x, y, hex)

  const colorButtonsWrapper = id("color-buttons")

  colorButtonsWrapper.classList.remove("closed")
}

function receivedPixelUpdate(x, y, hex) {
  setPixel(x, y, hexToRGB(hex))
}

function receivedFullUpdate(width, height, data) {
  setSize(width, height)

  let rawData = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let i = imgDataIndex(x, y)
      rawData.set(hexToRGB(data[y][x]), i)
      rawData[i + 3] = 255
    }
  }

  setData(new ImageData(rawData, width, height))
}

export { validateToken, placePixel }
