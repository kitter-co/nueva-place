import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"

import { id } from "./utils.js"
import { colorButtonsWrapper } from "./palette.js"
import { errorToast } from "./toast.js"

const firebaseConfig = {
  apiKey: "AIzaSyCFyU3lKCbyZYnrqSDNQZ2WjQA8gYhWKkA",
  authDomain: "nueva-place.firebaseapp.com",
  projectId: "nueva-place",
  storageBucket: "nueva-place.firebasestorage.app",
  messagingSenderId: "888072535263",
  appId: "1:888072535263:web:41d224e58b2f2ec1eefd6a",
  measurementId: "G-CHM59EXZ90"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

let signedIn = false

function isSignedIn() {
  return signedIn
}

function signInSuccess(user) {
  id("account-wrapper").classList.add("signed-in")

  id("account-name").innerText = user.displayName
  id("account-email").innerText = user.email
  id("profile-img").src = user.photoURL
  colorButtonsWrapper.classList.remove("hidden")
  signedIn = true
}

id("profile-img").onclick = () => {
  id("account-wrapper").classList.toggle("menu-open")
}

document.onmousedown = e => {
  if (!id("account-wrapper").contains(e.target)) {
    id("account-wrapper").classList.remove("menu-open")
  }
}

// SIGN IN

id("sign-in").onclick = () => {
  signInWithPopup(auth, provider).catch(error => {
    errorToast("Something went wrong while trying to sign in.")
    console.error(error)
  })
}

// SIGN OUT

id("sign-out").onclick = () => {
  signOut(auth).catch(error => {
    errorToast("Something went wrong while trying to sign out.")
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
    signInSuccess(user)
  } else {
    errorToast("You must use a @nuevaschool.org email address.")
  }
})

export { isSignedIn }
