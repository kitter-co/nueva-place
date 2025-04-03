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
  signInWithPopup(auth, provider).then(({ user }) => {
    if (!user.email.endsWith("@nuevaschool.org")) {
      let errorDiv = id("signin-error")
      errorDiv.style.display = "block"
      errorDiv.classList.add("shown")

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
}

// SIGN OUT

id("sign-out").onclick = () => {
  signOut(auth).then(hideUser)
}

onAuthStateChanged(auth, user => {
  if (user?.email.endsWith("@nueva.place")) {
    showUser(user.email, user.photoURL)
  } else {
    hideUser()
  }
})

function showUser(email, img) {
  id("account-email").innerText = email
  id("profile-img").style.display = "flex"
  id("profile-img").innerHTML = `<img src="${img}">`
  id("sign-in").style.display = "none"
  signedIn = true
}

function hideUser() {
  id("profile-img").style.display = "none"
  id("sign-in").style.display = "block"
  signedIn = false
}
