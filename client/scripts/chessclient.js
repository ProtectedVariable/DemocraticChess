"use strict";

const SERVER_URL = "ws://172.20.0.208:8080";
let team = -1;
let connected = false;
let id = -1;
let socket;
let open = false;
let name = "";

function onMessageReceived(msg) {
    console.log(msg.data);
    let message = JSON.parse(msg.data).message;
    switch(message.type) {
        case messageType.ID:
            id = message.params;
            console.log(id);
            break;
    }
}

function sendID() {
    if(id === -1) {
        window.setTimeout("sendID();",20);
    } else {
        socket.send(communication(id, newMessage(messageType.NAME, name)));
    }
}

function connect(lname) {
    socket = new WebSocket(SERVER_URL);
    socket.onmessage = onMessageReceived;
    socket.onerror = function(e) {
        alert("An error occured, you are not connected");
        return;
    };
    socket.onopen = function() {
        open = true;
    }
    name = lname;
    sendID();
}

function handleMessage(e, tagId) {
    if(e.which == 13 || e.keyCode == 13) {
        let msg = document.getElementById(tagId).value;
        if(msg !== "") {
            socket.send(communication(id, newMessage(messageType.CHAT, msg)));
            document.getElementById(tagId).value = "";
        }
    }
}
