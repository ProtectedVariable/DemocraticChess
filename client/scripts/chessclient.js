"use strict";

const SERVER_URL = "ws://172.20.0.208:8080";
//const SERVER_URL = "ws://localhost:8080";
let team = -1;
let connected = false;
let id = -1;
let socket;
let open = false;
let name = "";
let board;
let mouseCoord;

function handleClick() {
    refreshGame(board);
    let y = Math.floor(mouseCoord.y / tileSize);
    let x = Math.floor(mouseCoord.x / tileSize);
    let selectedPiece = board[y][x];
    let moves = getAllPossibleMoves(board, x, y);
    if(moves !== undefined) {
        moves.forEach(function(move) {
            highlightTile(move[1], move[0]);
        });
    }
}

function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
}

function getTeamName(i) {
    if(i === PieceColor.WHITE) {
        return "white";
    } else {
        return "black";
    }
}

function addToChat(sender, message) {
    document.getElementById("chat").innerHTML += "<br/><b>"+sender+"</b>: "+message;
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
}

function addPlayer(name, team) {
    document.getElementById("chat").value
}

function onMessageReceived(msg) {
    let message = JSON.parse(msg.data).message;
    switch(message.type) {
        case messageType.ID:
            id = message.params;
            console.log(id);
            break;
        case messageType.NEW_PLAYER:
            let player = message.params;
            addToChat("Server", "Player "+player.name+" has joined team "+getTeamName(player.team));
            addPlayer(message.params[0], message.params[1]);
            break;
        case messageType.INCOMING_CHAT:
            addToChat(message.params.sender, message.params.message);
            break;
        case messageType.BOARD:
            board = message.params.board;
            refreshGame(board);
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

function handleChatMessage(e, tagId) {
    if(e.which == 13 || e.keyCode == 13) {
        let msg = document.getElementById(tagId).value;
        if(msg !== "") {
            socket.send(communication(id, newMessage(messageType.CHAT, msg)));
            document.getElementById(tagId).value = "";
        }
    }
}
