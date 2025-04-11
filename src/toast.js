import { id } from "./utils.js"

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

export { errorToast }
