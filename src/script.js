import "./canvas.js"
import "./toolbar.js"
import { updateTheme } from "./theme.js"

for (let i of document.querySelectorAll("#theme-selector > button")) {
  i.onclick = () => {
    updateTheme(i.dataset.theme)
  }
}
