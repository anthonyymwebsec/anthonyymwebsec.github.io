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
let chatroomsRef = rtdb.ref(db, "/chatRoom/");

var chatroomNames = []; //chatrooms user is part of
let chatroomNamesRef = rtdb.ref(db, "/chatRoomNames/");
rtdb.get(chatroomNamesRef).then((snapshot) => {
  if (snapshot.exists()) {
    // chatroomNamesAll: key/value with random_id: {name: "room1", users: {uid: {uid: "uid"}}}
    let chatroomNamesAll = snapshot.val();
    let keys = Object.keys(chatroomNamesAll);
    for (let i = 0; i < keys.length; i++) {
      if (!!chatroomNamesAll[keys[i]].users[currentUser.uid]) {
        addChatTab(chatroomNamesAll[keys[i]].name, chatrommNamesAll[keys[i]].users);
        // chatroomNames.push(chatroomNamesAll[keys[i]]);
      }
    }

    // for (let i = 0; i < chatroomNames.length; i++) {
    //   let chatroomRef = rtdb.ref(db, "/chatRoomNames/" + Object.keys(chatroomNames[i])[0]);
    //   rtdb.get(chatroomRef).then((snapshot) => {
    //     if (snapshot.exists()) {
    //       addChatTab(snapsho, snapshot.val().child("users").size);     
    //     }
    //   });
    // }
  }
});

// rtdb.get(chatroomsRef).then((snapshot) => {
//   if (snapshot.exists()) {
//     console.log("snapshot.val() = " + JSON.stringify(snapshot.val()));
//     snapshot.forEach(function(room) {
//       console.log("room: " + room);
//       console.log("room.val().users: " + room.val().users);

//       console.log("currentUser.uid = " + currentUser.uid);
//       var roomKeys = Object.keys(room.val().users);
//       for (let i = 0; i < roomKeys.length; i++) {
//         let roomKey = roomKeys[i];
//         if (room.val().users[roomKey] != null && room.val().users[roomKey].uid == currentUser.uid) {
//           console.log("adding chatroom " + room.val().chatroom_name);
//           addChatTab(room.val().chatroom_name, room.child("users").size);          
//         }
//       }
//     });
//   }
// });

$("#app").hide();
$("#chatroom_settings").hide();
var chatRef = "";

var currentRoomName = null;
var chatroomKey = null;
var renderChatWindow = function(chatroomName) {
  if (currentRoomName == chatroomName) {
    return
  }
  currentRoomName = chatroomName;

  console.log("rendering chat window");

  $("#join_or_create_room_window").hide();
  $("#join_room_window").hide();

  // reset all child tab's background color to match CSS exact active one 
  var roomTabBar = document.getElementById("chatroom_tab");
  var roomTabChild = roomTabBar.children;
  console.log("roomTabChild.length ==")
  for (var i=0; i< roomTabChild.length; i++) {
    if (roomTabChild[i].firstChild.nodeValue == chatroomName) {
      console.log("roomTabChild[i].firstChild.nodeValue == chatroomName");
      roomTabChild[i].style.backgroundColor="#ccc";
    } else {
      console.log("roomTabChild[i].firstChild.nodeValue != chatroomName");
      roomTabChild[i].style.backgroundColor="#f1f1f1";
    }
  }

  $("#app").show();
  $("#chat_window").empty();
  $("#users_list").empty();

  let titleRef = rtdb.ref(db, "/chatRoom/");

  rtdb.get(rtdb.query(titleRef, rtdb.orderByChild("chatroom_name"), rtdb.equalTo(chatroomName))).then((snapshot) => {
    if (snapshot.exists()) {
      chatroomKey = Object.keys(snapshot.val())[0];

      console.log("snapshot.val().owner = " + snapshot.val()[chatroomKey].owner);
      console.log("currentUser.uid = " + currentUser.uid);
      if (snapshot.val()[chatroomKey].owner == currentUser.uid) {
        $("#chatroom_settings").show();
        console.log("showing chatroom_settings");
      } else {
        $("#chatroom_settings").hide();
        console.log("not showing chatroom_settings");
      }

      chatRef = rtdb.ref(db, "/chatRoom/" + chatroomKey + "/chats/");
      console.log("snapshot exists for chatRef = " + chatRef);

      if (!chatRoomHashMap.has(chatroomKey)) {
        chatRoomHashMap.set(chatroomKey, chatroomKey);
        $("#chat_window").empty();
        rtdb.onChildAdded(chatRef, ss => {
          setItemDiv(ss.val());
        });
      }

      scrollToBottom();
    } else {
      alert("snapshot doesn't exist")
    }
  });
}

// create message box
var setItemDiv=function(obj) {
  var chatBox = document.getElementById("chat_window");
  var message = obj.content;
  var user = obj.displayName;
  var uid = obj.uid;
  var msgDiv = document.createElement("div"); 
  if (uid == currentUser.uid) {
    msgDiv.innerText = message;
      msgDiv.classList.add("my_chat");
  } else {
    msgDiv.innerText = "[" + user + "] " + message;
    msgDiv.classList.add("others_chat");
  }
  chatBox.appendChild(msgDiv);
}

var addUserRow = function(user) {
  var usersList = document.getElementById("users_list");

  var userRow = document.createElement("div");
  userRow.id = "user-row" + user.uid;
  userRow.innerText = user.displayName;

  usersList.appendChild(userRow);

  var userRowButton = document.createElement("button");
  userRowButton.classList.add("tablinks");
  userRowButton.innerText = "Remove";
  userRowButton.onclick = function() {
    $("#user-row" + user.uid).remove();
    
    //TODO: remove user from db chatroom
    let userRef = rtdb.ref(db, "/chatRoom/" + chatroomKey + "/users/" + user.uid);
    rtdb.remove(userRef);
  }
  userRow.appendChild(userRowButton);
}

var renderChatroomSettings = function() {
  $("#chatroom_settings").show();
  renderUserRows();
}

var deleteChatroom = function() {
  if (confirm("Are you sure you want to delete chat room " + currentRoomName + " ?")) {
    $("#app").hide();
    $("#chatroom_settings").hide();
    var chatTabBar = document.getElementById("chatroom_tab");
    var chatTabs = chatTabBar.children;
    for (var i=0; i< chatTabs.length; i++) {
      if (chatTabs[i].firstChild.nodeValue == currentRoomName) {
        console.log("removing tab" + currentRoomName);
        chatTabBar.removeChild(chatTabs[i]);
        // $("#" + currentRoomName).remove();
      }
    }
    
    rtdb.get(rtdb.query(chatroomsRef, rtdb.orderByChild("chatroom_name"), rtdb.equalTo(currentRoomName))).then((snapshot) => {
      if (snapshot.exists()) {
        var firstKey = Object.keys(snapshot.val())[0];
        var currentChatroomRef = rtdb.ref(db, "/chatRoom/" + firstKey)
        rtdb.remove(currentChatroomRef);
      }
    });
  }
}

var renderUserRows = function() {
  console.log("chatroomName = " + currentRoomName);
  $("#users_list").empty();

  rtdb.get(rtdb.query(chatroomsRef, rtdb.orderByChild("chatroom_name"), rtdb.equalTo(currentRoomName))).then((snapshot) => {
    if (snapshot.exists()) {
      var firstKey = Object.keys(snapshot.val())[0];
      let chatroomUsersRef = rtdb.ref(db, "/chatRoom/" + firstKey + "/users");
      console.log("snapshot exists for chatroomUsersRef = " + chatroomUsersRef);

      rtdb.get(chatroomUsersRef).then((snapshot) => {
        if (snapshot.exists()) {
          let chatroomUsers = snapshot.val();
          console.log("chatroomUsers = " + chatroomUsers);
          let chatroomUserKeys = Object.keys(chatroomUsers); 
          for (let i = 0; i < chatroomUserKeys.length; i++) {
            let chatroomUser = chatroomUsers[chatroomUserKeys[i]];
            console.log("chatroomUser = " + chatroomUser);
            let usersRef = rtdb.ref(db, "/users/" + chatroomUser.uid);
            rtdb.get(usersRef).then((snapshot) => {
              if (snapshot.exists()) {
                console.log("adding user " + snapshot.val());
                addUserRow(snapshot.val());
              }
            });
          }
          var chatroomSettings = document.getElementById("chatroom_settings");
          var usersList = document.getElementById("users_list");
          chatroomSettings.append(usersList);
        } else {
          console.log("chatroom users snapshot doesn't exist");
        }
      });
    } else {
      console.log("chatroom snapshot doesn't exist");
    }
  });
}

var addChatTab = function(chatroomName, userCount) {
  var msgDiv = document.createElement("button");
  msgDiv.classList.add("tablinks");
  msgDiv.innerText = chatroomName;
  msgDiv.id = chatroomName;
  msgDiv.onclick = function() {
    renderChatWindow(chatroomName);
  }
  if (userCount!=null) {
    var msgBadge = document.createElement("span");
    msgBadge.classList.add("badge");
    msgBadge.innerText=userCount;
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
  $("#chatroom_settings").hide();
}

var joinOrCreateChatRoomSubmit = function() {
  let chatroomsRef = rtdb.ref(db, "/chatRoom/");

  let name = document.querySelector("#chatroom_name").value;
  if (name.trim() === "") {
    alert("Please enter a chatroom name.")
    return;
  } else {
    rtdb.get(rtdb.query(chatroomsRef, rtdb.orderByChild("chatroom_name"), rtdb.equalTo(name))).then((snapshot) => {
      if (snapshot.exists()) {
        if (confirm("Would you like to join the chatroom '" + name + "'?")) {
          var firstKey = Object.keys(snapshot.val())[0];
          let chatroomUserRef = rtdb.ref(db, "/chatRoom/" + firstKey + "/users/" + currentUser.uid);
          rtdb.set(chatroomUserRef, {
            uid: currentUser.uid
          });
        }
        return;
      } else if (confirm("Would you like to create the chatroom '" + name + "'?")) {
        let newObj = {
          "chatroom_name": name,
          "owner": currentUser.uid,
          "users": {
            "uid": {"uid": currentUser.uid}
          }
        };
        rtdb.push(chatroomsRef, newObj);
        addChatTab(name, 1);
      }
    });
  }
  $("#app").show();
  $("#join_or_create_room_window").hide();
}

var currentUser = null;
fbauth.onAuthStateChanged(auth, user => {
  var signinStatus = document.getElementById("signin_status");

  if (!!user) {
    // user signed in, so show the app
    console.log(`'Logged in as ${user.email}'`);
    $("#sign_out_button").show();
    $("#sign_in_button").hide();
    currentUser = user;
    let usersRef = rtdb.ref(db, "/users/" + user.uid);

    // add user to /users in db
    rtdb.set(usersRef, {
      displayName: user.displayName,
      email: user.email,
      uid: user.uid
    });

    // add sign in user text
    signinStatus.innerText = "Signed in as " + user.displayName + " (" + user.email + ")";
  } else {
    // user not signed in, so show login page
    console.log('No user, showing login');
    $("#sign_out_button").hide();
    $("#sign_in_button").show();
    signinStatus.innerText = "";
  }
});

document.querySelector("#sign_in_button").addEventListener("click", signIn);
document.querySelector("#sign_out_button").addEventListener("click", signOutCallback);
// document.querySelector("#signin_status_button").addEventListener("click", checkSignInOutCallback);
document.querySelector("#join_or_create_room_button").addEventListener("click", joinOrCreateChatRoom);
document.querySelector("#join_or_create_room_window_submit").addEventListener("click", joinOrCreateChatRoomSubmit);
document.querySelector("#open_chatroom_settings_button").addEventListener("click", renderChatroomSettings);
document.querySelector("#delete_chatroom_btn").addEventListener("click", deleteChatroom);
scrollToBottom();
