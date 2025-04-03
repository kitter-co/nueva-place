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
document.getElementById("sign-in").addEventListener("click", () => {
  signInWithPopup(auth, provider).then(result => {
    const user = result.user
    if (!user.email.endsWith("@nuevaschool.org")) {
      let errorDiv = document.getElementById("signin-error")
      errorDiv.style.display = "block"
      setTimeout(() => {
        errorDiv.classList.add("shown")
      }, 10) // this is so the erroeDiv actually transitions

      setTimeout(() => {
        errorDiv.classList.remove("shown")
        setTimeout(() => {
          errorDiv.style.display = "none"
        }, 600)
      }, 5000)

      signOut(auth)

    }
    console.log(user)
    showUser(user.email, user.photoURL)
  })
})

//SIGN OUT
document.getElementById("sign-out").addEventListener("click", () => {
  signOut(auth).then(() => {
    hideUser()
  })
})

onAuthStateChanged(auth, user => {
  if (user && user.email.endsWith("@nueva.place")) {
    showUser(user.email)
  } else {
    hideUser()
  }
})

function showUser(email) {
  document.getElementById("account-email").innerText = email
  document.getElementById("profile-img").style.display = "block"
  document.getElementById("sign-in").style.display = "none"
  signedIn = true
}

function hideUser() {
  document.getElementById("profile-img").style.display = "none"
  document.getElementById("sign-in").style.display = "block"
  signedIn = false
}
