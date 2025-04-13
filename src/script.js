import "./canvas.js"

onload = () => {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.id = "dark"
  } else {
    document.documentElement.id = ""
  }
}
