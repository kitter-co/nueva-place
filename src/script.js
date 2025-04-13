import "./canvas.js"

onload = () => {
  document.body.classList.remove("disable-transitions")

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.id = "dark"
  } else {
    document.documentElement.id = ""
  }
}
