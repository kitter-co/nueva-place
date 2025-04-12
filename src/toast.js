import { textToHTML, id } from "./utils.js"

const toastWrapper = id("toast-wrapper")
let toastHideTimeout

function errorToast(msg = "Something went wrong :(", bug = false) {
  toast(msg, true, bug)
}

function toast(msg = "Something went wrong :(", error = false, bug = false) {
  if (bug) msg += "\n\n(You found a bug! 🎉)"
  let sentences = msg.split(/(?<=[.!?]) +/g)
                     .map(textToHTML)
                     .map((x, i) => i ? `<span style="display: inline-block;">${x}</span>` : x)
  id("toast").innerHTML = sentences.join(" ")

  // make sure it is a normal toast if needed
  id("toast").classList.remove("error")
  if (error) id("toast").classList.add("error")

  clearTimeout(toastHideTimeout)
  // force the transition to play again even if it is already shown
  toastWrapper.classList.remove("shown")
  toastWrapper.style.transition = "none"
  void toastWrapper.offsetWidth // force css recalc
  toastWrapper.style.transition = ""
  toastWrapper.classList.add("shown")

  toastHideTimeout = setTimeout(() => toastWrapper.classList.remove("shown"), 5000)
}

export { errorToast, toast }
