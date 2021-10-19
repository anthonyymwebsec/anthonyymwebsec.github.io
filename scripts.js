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
let chatRoomHashMap = new Map();
let chatroomRef = rtdb.ref(db, "/chatRoom/");

rtdb.get(chatroomRef).then((snapshot) => {
  if (snapshot.exists()) {
    console.log("snapshot.val() = " + JSON.stringify(snapshot.val()));
    snapshot.forEach(function(room) {
      addChatTab(room.val().chatroom_name, room.child("users").size); 
    });
  }
});

// rtdb.onValue(chatroomRef, ss=> {
//   ss.forEach(function(childSnapshot) {
//     var chatroomName = childSnapshot.val().chatroom_name;
//     addChatTab(chatroomName);
//   });
// });
$("#app").hide();
var chatRef = "";

var renderChatWindow = function(chatroomName) {
  console.log("rendering chat window");

  $("#join_or_create_room_window").hide();
  $("#join_room_window").hide();

  // reset all child tab's background color to match CSS exact active one 
  var roomTabBar = document.getElementById("chatroom_tab");
  var roomTabChild = roomTabBar.children;
  for (var i=0; i< roomTabChild.length; i++) {
    if (roomTabChild[i].innerHTML==chatroomName) {
      roomTabChild[i].style.backgroundColor="#ccc"
    } else {
      roomTabChild[i].style.backgroundColor="#f1f1f1"
    }
  }

  $("#app").show();

  // remove all existing message node from the chat window div
  var chatBox = document.getElementById("chat_window");
  while (chatBox.firstChild) {
    chatBox.removeChild(chatBox.firstChild);
  }
  // chatBox.innerHTML = "<div id='chat_window' class='chat_window'></div>";

  let titleRef = rtdb.ref(db, "/chatRoom/");

  rtdb.get(rtdb.query(titleRef, rtdb.orderByChild("chatroom_name"), rtdb.equalTo(chatroomName))).then((snapshot) => {
    if (snapshot.exists()) {
      var firstKey = Object.keys(snapshot.val())[0];
      chatRef = rtdb.ref(db, "/chatRoom/" + firstKey + "/chats/");
      console.log("snapshot exists for chatRef = " + chatRef);

      if (!chatRoomHashMap.has(firstKey)) {

        chatRoomHashMap.set(firstKey, firstKey);
        $("#chat_window").empty();
        rtdb.onChildAdded(chatRef, ss => {
          setItemDiv(ss.val());
        });
          
      // } else {
      //   var chatItems = snapshot.child(firstKey+"/chats").val();
      //   if (chatItems!=null) {
      //     var children = chatItems.childNodes;
      //     childNodes.forEach(setItemDiv);

        // }
      }

      scrollToBottom();
      // });
    } else {
      alert("snapshot doesn't exist")
    }
  });
}

var setItemDiv=function(obj) {
  console.log("onChildAdded with obj = " + JSON.stringify());
  var chatBox = document.getElementById("chat_window");
  // ss.forEach(function(childSnapshot) {
    // alert("childSnapshot.val() = " + JSON.stringify(childSnapshot.val()));
    var message = obj.content;
    var user = obj.displayName;
    var uid = obj.uid;
    var msgDiv = document.createElement("div"); 
    if (uid == currentUser.uid) {
      msgDiv.innerHTML = message;
        msgDiv.classList.add("my_chat");
    } else {
      msgDiv.innerHTML = "<i>" + user + "</i> " + message;
      msgDiv.classList.add("others_chat");
    }
    chatBox.appendChild(msgDiv);

}

var addChatTab = function(chatroomName, userCount) {
  var msgDiv = document.createElement("button");
  msgDiv.classList.add("tablinks");
  msgDiv.innerHTML = chatroomName;
  msgDiv.id = chatroomName;
  msgDiv.onclick = function() {
    renderChatWindow(chatroomName);
  }
  if (userCount!=null) {
    var msgBadge = document.createElement("span");
    msgBadge.classList.add("badge");
    msgBadge.innerHTML=userCount;
    msgDiv.appendChild(msgBadge);
  }
  var chatTab = document.getElementById("chatroom_tab");
  chatTab.appendChild(msgDiv)
}

var submitHandler = function(eventObject) {
  let message = document.querySelector("#message").value;
  let newObj = {
    "displayName": currentUser.displayName,
    "content": message,
    "uid": currentUser.uid
  };
  rtdb.push(chatRef, newObj);
  scrollToBottom();
}

document.querySelector("#submit_button").addEventListener("click", submitHandler);

var scrollToBottom = function() {
  $("#chat_window").stop().animate({ scrollTop: $("#chat_window")[0].scrollHeight}, 1000);
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

$("#join_or_create_room_window").hide();

var joinOrCreateChatRoom = function() {
  $("#join_or_create_room_window").show();
  $("#app").hide();
}

var joinOrCreateChatRoomSubmit = function() {  
  let titleRef = rtdb.ref(db, "/chatRoom/");

  let name = document.querySelector("#chatroom_name").value;
  if (name.trim() === "") {
    alert("Please enter a chatroom name.")
    return;
  } else {
    rtdb.get(rtdb.query(titleRef, rtdb.orderByChild("chatroom_name"), rtdb.equalTo(name))).then((snapshot) => {
      if (snapshot.exists()) {
        if (confirm("Would you like to join the chatroom '" + name + "'?")) {
          var firstKey = Object.keys(snapshot.val())[0];
          chatRef = rtdb.ref(db, "/chatRoom/" + firstKey + "/users/");
          var obj = {
            "uid": currentUser.uid
          }
          rtdb.push(chatRef, obj);
        }
        return;
      } else {
        let newObj = {
          "chatroom_name": name,
          "owner": currentUser.uid,
          "users": [currentUser.uid],
          "requesters": []
        };
        rtdb.push(titleRef, newObj);
        addChatTab(name, 1);
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
    $("#sign_out_button").show();
    $("#sign_in_button").hide();
    currentUser = user;
  } else {
    // user not signed in, so show login page
    console.log('No user, showing login');
    $("#sign_out_button").hide();
    $("#sign_in_button").show();
  }
});

document.querySelector("#sign_in_button").addEventListener("click", signIn);
document.querySelector("#sign_out_button").addEventListener("click", signOutCallback);
// document.querySelector("#signin_status_button").addEventListener("click", checkSignInOutCallback);
document.querySelector("#join_or_create_room_button").addEventListener("click", joinOrCreateChatRoom);
document.querySelector("#join_or_create_room_window_submit").addEventListener("click", joinOrCreateChatRoomSubmit);
scrollToBottom();