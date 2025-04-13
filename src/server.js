import {
  setSize,
  setData,
  imgDataIndex,
  getPixel,
  setPixel,
  draw,
  startCooldown,
  endCooldown
} from "./canvas.js"

import { errorToast } from "./toast.js"
import { id, hexToRGB, rgbToHex } from "./utils.js"

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener(
  'message',
  (event) => interpret(event.data)
);

function interpret(data) {
  const msg  = JSON.parse(data);
  const body = JSON.parse(msg.body);

  switch (msg.type) {
    case 'pixels':
      receivedFullUpdate(body[0].length, body.length, body)
      draw(true)
      break;

    case 'update':
      receivedPixelUpdate(body.x, body.y, body.color)
      break;

    case 'cooldown': {
      const elapsed = Math.floor(Date.now() / 1000) - body

      if (elapsed < 0.1 * 60) {
        startCooldown(body)
        setTimeout(() => endCooldown(), (0.1 * 60 - elapsed) * 1000)
      }

      break;
    }

    case 'error':
      errorToast(body)
      break;

    default:
      break;
  }
}

function send(type, body) {
  const payload = {
    type,
    body: JSON.stringify(body)
  };

  socket.send(JSON.stringify(payload));
}

function validateToken(token) {
  send('token', token);
}

function updatePixel(x, y, color) {
  send('update', { x, y, color });
}

function placePixel(x, y, rgb) {
  // let oldRGB = getPixel(x, y), placeTime = performance.now()

  setPixel(x, y, rgb)
  startCooldown()

  let hex = rgbToHex(rgb)
  updatePixel(x, y, hex)

  const colorButtonsWrapper = id("color-buttons")

  colorButtonsWrapper.classList.remove("closed")
  colorButtonsWrapper.style.removeProperty("--selected-color")
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
