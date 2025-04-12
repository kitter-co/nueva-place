import { textToHTML, id } from "./utils.js"

const errorToastWrapper = id("error-toast-wrapper")
let toastHideTimeout

function errorToast(msg = "Something went wrong :(", bug = false) {
  if (bug) msg += "\n\n(You found a bug! 🎉)"
  let sentences = msg.split(/(?<=[.!?]) +/g)
                     .map(textToHTML)
                     .map((x, i) => i ? `<span style="display: inline-block;">${x}</span>` : x)
  id("error-toast").innerHTML = sentences.join(" ")

  clearTimeout(toastHideTimeout)
  // force the transition to play again even if it is already shown
  errorToastWrapper.classList.remove("shown")
  errorToastWrapper.style.transition = "none"
  void errorToastWrapper.offsetWidth // force css recalc
  errorToastWrapper.style.transition = ""
  errorToastWrapper.classList.add("shown")

  toastHideTimeout = setTimeout(() => errorToastWrapper.classList.remove("shown"), 5000)
}

export { errorToast }
