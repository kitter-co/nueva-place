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

updateTheme(localStorage.getItem("theme") || "auto")

export { updateTheme }
