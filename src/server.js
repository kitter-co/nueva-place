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
import { hexToRGB, rgbToHex } from "./utils.js"

function placePixel(x, y, rgb) {
  let oldRGB = getPixel(x, y), placeTime = performance.now()

  setPixel(x, y, rgb)
  startCooldown()
  // let hex = rgbToHex(rgb)
  Promise.reject() // TODO replace with actual server request
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

// TODO placeholder data
Promise.resolve({ json() { return { width: 25, height: 5, img: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] } } })
// fetch("the data")
  .catch(err => {
    alert(`It didn't work :(\n\nERROR:\n${err.message}`)
  })
  .then(res => res.json()).then(data => {
    receivedFullUpdate(data.width, data.height, data.img)
    draw(true)
  })

export { placePixel }
