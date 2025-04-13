import "./canvas.js"
import "./toolbar.js"

onload = () => {
  document.body.classList.remove("disable-transitions")
}

function updateTheme(theme) {
  if (theme === "dark") {
    document.documentElement.id = "dark"
  } else if (theme === "light") {
    document.documentElement.id = ""
  } else {
    if (matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.id = "dark"
    } else {
      document.documentElement.id = ""
    }
  }

  document.querySelector("#theme-selector > button.selected")?.classList.remove("selected")
  document.querySelector(`#theme-selector > button[data-theme="${theme}"]`).classList.add("selected")

  localStorage.setItem("theme", theme)
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
