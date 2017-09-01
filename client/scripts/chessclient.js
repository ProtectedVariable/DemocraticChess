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
let selectedPiece;
let lastMoves;
let lastX, lastY;

function handleClick() {
    refreshGame(board);
    let y = Math.floor(mouseCoord.y / tileSize);
    let x = Math.floor(mouseCoord.x / tileSize);
    let selected = board[y][x];
    let moves = getAllPossibleMoves(board, x, y);
    if(selected.color === team) {
        if(moves !== undefined) {
            moves.forEach(function(move) {
                highlightTile(move[1], move[0]);
            });
        }
    }
    let voteOK = false;
    //if we clicked an empty tile or an enemy tile, and we had a piece selected, and the piece had possible moves
    if(selected === undefined || selected.color !== team) {
        if(selectedPiece !== undefined && selectedPiece.color === team) {
            if(lastMoves !== undefined) {
                //check if selected tile is part of the possible moves
                lastMoves.forEach(function(move) {
                    if(move[1] === x && move[0] === y) {
                        voteOK = true;
                    }
                });

                if(voteOK) {
                    sendMove(lastX, lastY, x, y);
                }
            }
        }
    }
    lastX = x;
    lastY = y;
    selectedPiece = selected;
    lastMoves = moves;
}

function getMousePos(canvas, e) {
    let rect = canvas.getBoundingClientRect();
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
    document.getElementById("chat").innerHTML += `<br/><b>${sender}</b>: ${message}`;
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
}

function removePlayer(player) {
    addToChat("Server",`Player ${player.name} left`);
    let elem = document.getElementById(player.name);
    elem.parentNode.removeChild(elem);
}

function addPlayer(player) {
    addToChat("Server", "Player "+player.name+" has joined team "+getTeamName(player.team));
    if(player.name !== name) {
        document.getElementById("info").innerHTML += '<li id="'+player.name+'" class="'+getTeamName(player.team)+'">'+player.name+"</li>";
    }
}

function applyMove(mv) {
    move(board, mv.startCell.y, mv.startCell.x, mv.endCell.y, mv.endCell.x);
    refreshGame(board);
}

function setPlayerList(lst) {
    lst.forEach(function(player) {
        document.getElementById("info").innerHTML += '<li id="'+player.name+'" class="'+getTeamName(player.team)+'">'+player.name+"</li>";
    });
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
            addPlayer(player);
            break;
        case messageType.INCOMING_CHAT:
            addToChat(message.params.sender, message.params.message);
            break;
        case messageType.BOARD:
            board = message.params.board;
            refreshGame(board);
            break;
        case messageType.PLAYER_LEFT:
            let playerLeaving = message.params;
            removePlayer(playerLeaving);
            break;
        case messageType.TEAM:
            team = message.params;
            break;
        case messageType.MOVED:
            applyMove(message.params);
            break;
        case messageType.LIST:
            setPlayerList(message.params);
            break;
    }
}

function sendMove(bx, by, tx, ty) {
    let move = newMove(cell(bx, by), cell(tx, ty));
    socket.send(communication(id, newMessage(messageType.MOVE, move)));
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
    };
    name = lname;
    sendID();
}

function handleChatMessage(e, tagId) {
    if(e.which === 13 || e.keyCode === 13) {
        let msg = document.getElementById(tagId).value;
        if(msg !== "") {
            socket.send(communication(id, newMessage(messageType.CHAT, msg)));
            document.getElementById(tagId).value = "";
        }
    }
}
