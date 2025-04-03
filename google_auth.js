import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"

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

// SIGN IN

id("sign-in").onclick = () => {
  signInWithPopup(auth, provider).catch(console.error) // TODO error popup
}

// SIGN OUT

id("sign-out").onclick = () => {
  signOut(auth).catch(console.error) // TODO error popup
}

onAuthStateChanged(auth, user => {
  if (!user) {
    if (signedIn) location.reload()
    return
  }

  if (user.email.endsWith("@nuevaschool.org")) {
    signInSuccess(user.email, user.photoURL)
  } else {
    let errorElem = id("signin-error")
    errorElem.style.display = "block"
    errorElem.classList.add("shown")

    setTimeout(() => {
      errorElem.classList.remove("shown")
      setTimeout(() => {
        errorElem.style.display = "none"
      }, 600)
    }, 5000)
  }
})
