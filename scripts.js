import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJGSrbqnC5Kkb4cyaEoo1MZVBD66h9JQg",
  authDomain: "anthonyym-oauth.firebaseapp.com",
  databaseURL: "https://anthonyym-oauth-default-rtdb.firebaseio.com",
  projectId: "anthonyym-oauth",
  storageBucket: "anthonyym-oauth.appspot.com",
  messagingSenderId: "902134199194",
  appId: "1:902134199194:web:836f22a4e56f992be20023"
};

const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);
let auth = fbauth.getAuth(app);

let renderUser = function(userObj){
  $("#app").html(JSON.stringify(userObj));
  $("#app").append(`<button type="button" id="logout">Logout</button>`);
  $("#logout").on("click", ()=>{
    fbauth.signOut(auth);
  })
}

fbauth.onAuthStateChanged(auth, user => {
      if (!!user){
        $("#login").hide();
        $("#app").show();
        renderUser(user);
        let flagRef = rtdb.ref(db, "/flag");
        console.log("here");
rtdb.onValue(flagRef, ss=>{
  alert(ss.val());
})
      } else {
        $("#login").show();
        $("#app").html("");
      }
});


let rulesRef = rtdb.ref(db, "/rules");
rtdb.onValue(rulesRef, ss=>{
  let rules = ss.val();
  if (!!rules){
    $("#rules").html(rules);
  }
})


$("#register").on("click", ()=>{
  let email = $("#regemail").val();
  let p1 = $("#regpass1").val();
  let p2 = $("#regpass2").val();
  if (p1 != p2){
    alert("Passwords don't match");
    return;
  }
  fbauth.createUserWithEmailAndPassword(auth, email, p1).then(somedata=>{
    let uid = somedata.user.uid;
    let userRoleRef = rtdb.ref(db, `/users/${uid}/roles/user`);
    rtdb.set(userRoleRef, true);
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
    alert(errorCode);
    alert(errorMessage);
  });
});


$("#login").on("click", ()=>{
  let email = $("#logemail").val();
  let pwd = $("#logpass").val();
  fbauth.signInWithEmailAndPassword(auth, email, pwd).then(
    somedata=>{
      console.log(somedata);
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    });
});