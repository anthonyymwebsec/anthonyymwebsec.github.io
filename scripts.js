// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
//import { getAuth, onAuthStateChanged, getRedirectResult, signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js';
import * as fbauth from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

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
    var user = childSnapshot.val().username
    //console.log(message);
    //innerText = innerText + "<li>" + message + "</li>";
    li.appendChild(document.createTextNode(message))
    ul.appendChild(li);
  });
});

var submitHandler = function(eventObject) {
  let message = document.querySelector("#message").value;
  let newObj = {
    //"username": username,
    "content": message
  };
  rtdb.push(titleRef, newObj);
  scrollToBottom();
}

document.querySelector("#submit_button").addEventListener("click", submitHandler);

var scrollToBottom = function() {
  $(".chat_window").stop().animate({ scrollTop: $(".chat_window")[0].scrollHeight}, 1000);
}

var signIn = function() {
  alert("signing in");
  fbauth.signInWithRedirect(auth, provider);
  alert("fbauth.currentUser: " + fbauth.currentUser);
  alert("!!fbauth.currentUser: " + !!fbauth.currentUser);
}

var signOutCallback = function() {
  alert("signing out");
  fbauth.signOut(auth).then(function() {
    // sign-out success
    console.log("sign out success");
    alert("sign out success");
  }).catch(function(error) {
    // error
    console.log("sign out error");
    alert("sign out error");
  });
}

var checkSignInOutCallback = function() {
  alert("fbauth.currentUser: " + fbauth.currentUser);
  alert(`"currentUser: ${currentUser} currentUser.email: ${currentUser.email}"`);
  alert("currentUser: " + currentUser);
}

var currentUser = "null";

fbauth.onAuthStateChanged(auth, user => {
  if (!!user) {
    // user signed in, so show the app
    console.log(`'Logged in as ${user.email}'`);
    alert(`'Logged in as ${user.email}'`)
    $("#sign_out_button").show();
    $("#sign_in_button").hide();
    currentUser = user;
  } else {
    // user not signed in, so show login page
    console.log('No user, showing login');
    alert('No user, showing login');
    $("#sign_out_button").hide();
    $("#sign_in_button").show();
  }
});

document.querySelector("#sign_in_button").addEventListener("click", signIn);
document.querySelector("#sign_out_button").addEventListener("click", signOutCallback);
document.querySelector("#signin_status_button").addEventListener("click", checkSignInOutCallback);
scrollToBottom();
