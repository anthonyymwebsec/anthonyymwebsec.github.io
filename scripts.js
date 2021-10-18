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

let chatroomRef = rtdb.ref(db, "/chatRoom/");

rtdb.get(chatroomRef).then((snapshot) => {
  if (snapshot.exists()) {
    console.log("snapshot.val() = " + JSON.stringify(snapshot.val()));
    snapshot.forEach(function(room) {
      addChatTab(room.val().chatroom_name);
    });
  }
});

// rtdb.onValue(chatroomRef, ss=> {
//   ss.forEach(function(childSnapshot) {
//     var chatroomName = childSnapshot.val().chatroom_name;
//     addChatTab(chatroomName);
//   });
// });

var renderChatWindow = function(chatroomName) {
  $("#" + chatroomName).show();

  let titleRef = rtdb.ref(db, "/chatRoom/");

  rtdb.get(rtdb.query(titleRef, rtdb.orderByChild("chatroom_name"), rtdb.equalTo(chatroomName))).then((snapshot) => {
    if (snapshot.exists()) {
      var chatroomKey = snapshot.child(chatroomName).key;
      alert("key: " + chatroomKey);
    }  
  });

  rtdb.onValue(titleRef, ss=> {
    // document.querySelector("#msg_list").innerText = "";
    var chatBox = document.getElementById("chat_window");
    
    ss.forEach(function(childSnapshot) {
      var msgDiv = document.createElement("div");
      var message = childSnapshot.val().content
      var user = childSnapshot.val().displayName
      msgDiv.innerHTML = message;
      if (user = currentUser.displayName) {
          msgDiv.classList.add("my_chat");
      } else {
          msgDiv.classList.add("others_chat");
      }
      chatBox.appendChild(msgDiv);  
    });
  });
}

var addChatTab = function(chatroomName) {
  var msgDiv = document.createElement("button");
  msgDiv.classList.add("tablinks");
  msgDiv.innerHTML = chatroomName;
  msgDiv.id = chatroomName;
  msgDiv.onclick = function() {
    renderChatWindow(chatroomName);
  }

  var chatTab = document.getElementById("chatroom_tab");
  chatTab.appendChild(msgDiv)
}

var submitHandler = function(eventObject) {
  let message = document.querySelector("#message").value;
  let newObj = {
    "displayName": currentUser.displayName,
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
  alert(`"currentUser.displayName: ${currentUser.displayName} currentUser.email: ${currentUser.email}"`);
  alert((JSON.stringify(currentUser))
  )
}

$("#create_room_window").hide();

var createChatRoom = function() {
  $("#create_room_window").show();
  $("#app").hide();
}

var createChatRoomSubmit = function() {  
  let titleRef = rtdb.ref(db, "/chatRoom/");

  let name = document.querySelector("#chatroom_name").value;
  if (name.trim() === "") {
    alert("Please enter a chatroom name.")
    return;
  } else {
    rtdb.get(rtdb.query(titleRef, rtdb.orderByChild("chatroom_name"), rtdb.equalTo(name))).then((snapshot) => {
      if (snapshot.exists()) {
        alert("This chatroom name already exists.");
        return;
      } else {
        let newObj = {
          "chatroom_name": name,
          "owner": currentUser.uid,
          "users": [currentUser.uid],
          "requesters": []
        };
        rtdb.push(titleRef, newObj);
        addChatTab(name);
      }
    });
  }
  $("#app").show();
}

var currentUser = null;
fbauth.onAuthStateChanged(auth, user => {
  if (!!user) {
    // user signed in, so show the app
    console.log(`'Logged in as ${user.email}'`);
    alert(`'Logged in as ${user.email}'`)
    $("#app").show();
    $("#sign_out_button").show();
    $("#sign_in_button").hide();
    currentUser = user;
  } else {
    // user not signed in, so show login page
    console.log('No user, showing login');
    $("#app").hide()
    $("#sign_out_button").hide();
    $("#sign_in_button").show();
  }
});

document.querySelector("#sign_in_button").addEventListener("click", signIn);
document.querySelector("#sign_out_button").addEventListener("click", signOutCallback);
document.querySelector("#signin_status_button").addEventListener("click", checkSignInOutCallback);
document.querySelector("#create_room").addEventListener("click", createChatRoom);
document.querySelector("#create_room_submit").addEventListener("click", createChatRoomSubmit);
scrollToBottom();