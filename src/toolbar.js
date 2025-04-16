import { id } from "./utils.js"
import { toast } from "./toast.js"
import { canvas, download, getViewportDataArray, mouseX, mouseY, toggleHighlight } from "./canvas.js"

canvas.oncontextmenu = e => {
  openContextMenu()

  e.preventDefault()
  e.stopPropagation()
}

id("highlight-pixels").onclick = () => {
  let highlight = toggleHighlight()

  if (highlight) id("highlight-pixels").classList.add("selected")
  else id("highlight-pixels").classList.remove("selected")

  setTimeout(closeContextMenu, 100)
}

id("profile-button").onclick = () => {
  if (accountMenuOpen) {
    closeAccountMenu()
  } else {
    openAccountMenu()
  }
}

document.onmousedown = e => {
  if (!id("profile-button-wrapper").contains(e.target)) {
    closeAccountMenu()
  }
  if (!id("context-menu").contains(e.target) && !id("context-button-wrapper").contains(e.target)) {
    closeContextMenu()
  }
}

let accountMenuOpen = false, accountMenuTimeout

function openAccountMenu() {
  accountMenuOpen = true
  clearTimeout(accountMenuTimeout)

  id("account-menu").style.display = ""
  void id("account-menu").offsetWidth // force css recalc
  id("account-menu").classList.add("shown")
  id("profile-button").classList.add("selected")
}

function closeAccountMenu() {
  if (!accountMenuOpen) return
  accountMenuOpen = false

  id("account-menu").classList.remove("shown")
  id("profile-button").classList.remove("selected")
  accountMenuTimeout = setTimeout(() => {
    id("account-menu").style.display = "none"
  }, 200)
}

let contextMenuOpen = false, contextMenuTimeout

function openContextMenu(button = false) {
  contextMenuOpen = true
  clearTimeout(contextMenuTimeout)

  if (button) {
    id("context-button-wrapper").append(id("context-menu"))

    id("context-menu").style = ""
    id("context-menu-button").classList.add("selected")

    setTimeout(() => {
      if (id("context-menu-button").getBoundingClientRect().left < 10) {
        id("context-menu").style.right = "auto"
        id("context-menu").style.left = "0"
      }
    })
  } else {
    document.body.append(id("context-menu"))

    id("context-menu").style.position = "fixed"
    id("context-menu").style.right = "auto"
    id("context-menu").style.left = mouseX + "px"
    id("context-menu").style.top = mouseY + "px"
  }

  id("context-menu").classList.remove("shown")
  id("context-menu").style.display = ""
  void id("context-menu").offsetWidth // force css recalc
  id("context-menu").classList.add("shown")
}

id("context-menu-button").onclick = () => {
  if (contextMenuOpen && id("context-menu-button").classList.contains("selected")) {
    closeContextMenu()
  } else {
    openContextMenu(true)
  }
}

function closeContextMenu() {
  if (!contextMenuOpen) return
  contextMenuOpen = false

  id("context-menu").classList.remove("shown")
  id("context-menu-button").classList.remove("selected")
  contextMenuTimeout = setTimeout(() => {
    id("context-menu").style.display = "none"
  }, 200)
}

id("download-image").onclick = () => {
  download()
  closeContextMenu()
}

closeContextMenu()

id("copy-location").onclick = () => {
  navigator.clipboard.writeText(`${location.protocol}//${location.host}/?${getViewportDataArray()}`)
           .then(() => toast("URL to Current Viewport Copied!"))
  closeContextMenu()
}
