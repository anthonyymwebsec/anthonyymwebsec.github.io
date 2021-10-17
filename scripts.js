// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
//import { getAuth, onAuthStateChanged, getRedirectResult, signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js';
import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

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
const auth = fbauth.getAuth(app);
const provider = new fbauth.GoogleAuthProvider();

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

var signInOrOut = function() {
  if (!!fbauth.currentUser) {
    firebase.auth().signOut().then(function() {
      // sign-out success
      console.log("sign out success");
      alert("sign out success");
    }).catch(function(error) {
      // error
      console.log("sign out error");
      alert("sign out error");
    });
  } else {
    console.log("signing in");
    fbauth.signInWithRedirect(auth, provider);
  }
}

fbauth.getRedirectResult(auth)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = fbauth.GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
    alert("signed in user");
    alert(user.email);
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    const credential = fbauth.GoogleAuthProvider.credentialFromError(error);
    // ...
    console.log("auth error:");
    console.log("error.code: " + error.code);
    console.log("error.message: " + error.message);
    alert(`"auth error ${errorCode} ${errorMessage} ${email}"`);
  });

fbauth.onAuthStateChanged(auth, user => {
  if (!!user) {
    console.log(`'Logged in as ${user.email}'`);
    alert(`'Logged in as ${user.email}'`)
    document.querySelector("#sign_in_button").innerText = "Sign out"    
  } else {
    console.log('No user');
    alert('No user');
    document.querySelector("#sign_in_button").innerText = "Sign in"
  }
});

document.querySelector("#sign_in_button").addEventListener("click", signInOrOut);
scrollToBottom();