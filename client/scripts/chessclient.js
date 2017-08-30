"use strict";

const SERVER_URL = "ws://172.20.0.208:8080";
let team = -1;
let connected = false;
let id = -1;
let socket;
let open = false;
let name = "";

function getTeamName(i) {
    if(i === PieceColor.WHITE) {
        return "white";
    } else {
        return "black";
    }
}

function addToChat(sender, message) {
    document.getElementById("chat").value += "\n"+sender+": "+message;
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
}

function addPlayer(name, team) {
    document.getElementById("chat").value
}

function onMessageReceived(msg) {
    console.log(msg.data);
    let message = JSON.parse(msg.data).message;
    switch(message.type) {
        case messageType.ID:
            id = message.params;
            console.log(id);
            break;
        case messageType.NEW_PLAYER:
            addToChat("Server", "Player "+message.params[0]+" has joined team "+getTeamName(message.params[1]));
            addPlayer(message.params[0], message.params[1]);
            break;
        case messageType.INCOMING_CHAT:
            addToChat(message.params.sender, message.params.message);
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
