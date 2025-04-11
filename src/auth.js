import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"

import { id } from "./utils.js"
import { colorButtonsWrapper } from "./palette.js"
import { errorToast } from "./toast.js"

const firebaseConfig = {
  apiKey: "AIzaSyCFyU3lKCbyZYnrqSDNQZ2WjQA8gYhWKkA",
  authDomain: "nueva-place.firebaseapp.com",
  projectId: "nueva-place",
  storageBucket: "nueva-place.appspot.com",
  messagingSenderId: "888072535263",
  appId: "1:888072535263:web:41d224e58b2f2ec1eefd6a",
  measurementId: "G-CHM59EXZ90"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

let signedIn = false

// ACCOUNTS

function isSignedIn() {
  return signedIn
}

function signInSuccess(email, img) {
  id("account-email").innerText = email
  id("profile-img").style.display = "flex"
  id("profile-img").innerHTML = `<img src="${img}">`
  id("sign-in").remove()
  colorButtonsWrapper.classList.remove("hidden")
  signedIn = true
}

id("profile-img").onclick = () => {
  id("account-menu").classList.toggle("shown")
  id("profile-img").classList.toggle("menu-shown")
}

document.onmousedown = e => {
  if (!id("profile-img").contains(e.target) && !id("account-menu").contains(e.target)) {
    id("account-menu").classList.remove("shown")
    id("profile-img").classList.remove("menu-shown")
  }
}

// SIGN IN

id("sign-in").onclick = () => {
  signInWithPopup(auth, provider).catch(error => {
    errorToast("Something went wrong while trying to sign in.", true)
    console.error(error)
  })
}

// SIGN OUT

id("sign-out").onclick = () => {
  signOut(auth).catch(error => {
    errorToast("Something went wrong while trying to sign out.", true)
    console.error(error)
  })
}

onAuthStateChanged(auth, user => {
  if (!user) {
    if (signedIn) location.reload()
    return
  }

  if (user.email.endsWith("@nuevaschool.org")) {
    console.log("auth, user:", auth, user)
    signInSuccess(user.email, user.photoURL)
  } else {
    errorToast("You must use a @nuevaschool.org email address.")
  }
})

export { isSignedIn }
