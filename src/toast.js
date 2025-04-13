import { textToHTML, id } from "./utils.js"

const toastElem = id("toast")
let toastHideTimeout

function errorToast(msg = "Something went wrong :(", bug = false) {
  toast(msg, true, bug)
}

function toast(msg = "Something went wrong :(", error = false, bug = false) {
  if (bug) msg += "\n\n(You found a bug! 🎉)"
  let sentences = msg.split(/(?<=[.!?]) +/g)
                     .map(textToHTML)
                     .map((x, i) => i ? `<span style="display: inline-block;">${x}</span>` : x)
  toastElem.innerHTML = sentences.join(" ")

  // make sure it is a normal toast if needed
  toastElem.classList.remove("error")
  if (error) toastElem.classList.add("error")

  clearTimeout(toastHideTimeout)
  // force the transition to play again even if it is already shown
  toastElem.classList.remove("shown")
  toastElem.style.transition = "none"
  void toastElem.offsetWidth // force css recalc
  toastElem.style.transition = ""
  toastElem.classList.add("shown")

  toastHideTimeout = setTimeout(() => toastElem.classList.remove("shown"), 5000)
}

export { errorToast, toast }
