import "./canvas.js"

onload = () => {
  document.body.classList.remove("disable-transitions")
}

function updateTheme(theme) {
  if (theme == "auto") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.id = "dark"
    } else {
      document.documentElement.id = ""
    }

    localStorage.setItem("theme", "auto")
  } else if (theme == "dark") {
    document.documentElement.id = "dark"
    localStorage.setItem("theme", "dark")
  } else if (theme == "light") {
    document.documentElement.id = ""
    localStorage.setItem("theme", "light")
  }

  document.querySelector("#theme-selector > button.selected")?.classList.remove("selected")
  document.querySelector(`#theme-selector > button[data-theme="${theme}"]`).classList.add("selected")
}

for (let i of document.querySelectorAll("#theme-selector > button")) {
  i.onclick = () => {
    updateTheme(i.dataset.theme)
  }
}

if (localStorage.getItem("theme")) {
  updateTheme(localStorage.getItem("theme"))
} else {
  updateTheme("auto")
}
