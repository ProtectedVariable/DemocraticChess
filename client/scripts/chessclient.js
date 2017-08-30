"use strict";

const SERVER_URL = "ws://172.20.0.208:8080";
let team = -1;
let connected = false;
let id = -1;
let socket;

function onMessageReceived(msg) {
    console.log(msg.data);
}

function connect(name) {
    socket = new WebSocket(SERVER_URL);
    socket.onmessage = onMessageReceived;
    socket.onerror = function(e) {
        alert("An error occured, you are not connected");
    };
}

function handleMessage(e, id) {
    if(e.which == 13 || e.keyCode == 13) {
        let msg = document.getElementById(id).value;
        if(msg !== "") {
            socket.send();
            document.getElementById(id).value = "";
        }
    }
}
