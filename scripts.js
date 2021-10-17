// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js';

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBv3A17KiSfoqjg1gzsnkPrI-HH23mhSUk",
  authDomain: "test-firebase-69162.firebaseapp.com",
  databaseURL: "https://test-firebase-69162-default-rtdb.firebaseio.com",
  projectId: "test-firebase-69162",
  storageBucket: "test-firebase-69162.appspot.com",
  messagingSenderId: "1076110152420",
  appId: "1:1076110152420:web:b429bba9d0f98ffe8f52f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Configure auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Configure rtdb
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/chatRoom/room1/");
let peopleRef = rtdb.child(titleRef, "people");
// let user = firebase.UserInfo.displayName;

rtdb.onValue(titleRef, ss=> {
  document.querySelector("#msg_list").innerText = "";

  ss.forEach(function(childSnapshot) {
    var ul = document.getElementById("msg_list");
    var li = document.createElement("li");
    var message = childSnapshot.val().content
    //console.log(message);
    //innerText = innerText + "<li>" + message + "</li>";
    li.appendChild(document.createTextNode(message))
    ul.appendChild(li);
  });
});

var submitHandler = function(eventObject) {
  let message = document.querySelector("#message").value;
  let newObj = {"content": message};
  rtdb.push(titleRef, newObj);
  scrollToBottom();
}

document.querySelector("#submit_button").addEventListener("click", submitHandler);

var scrollToBottom = function() {
  $(".chat_window").stop().animate({ scrollTop: $(".chat_window")[0].scrollHeight}, 1000);
}

var signIn = function() {
  signInWithRedirect(auth, provider);
  getRedirectResult(auth)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
    console.log(user);
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
}

//document.querySelector("#sign_in_button").addEventListener("click", signInWithRedirect(auth, provider));
scrollToBottom();
