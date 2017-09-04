"use strict";

//const SERVER_URL = "ws://172.20.1.66:8080";
const SERVER_URL = "ws://localhost:8080";
const BASE_TIME = 60;
let team = -10;
let connected = false;
let id = -1;
let socket;
let open = false;
let name = "";
let engine;
let mouseCoord;
let selectedPiece;
let lastMoves;
let lastX;
let lastY;
let time = 60;
let teamPlaying = -1;
let timerLoop;

let chessRenderer;
const images = [0,image("./images/black_pawn.png"), image("./images/black_tower.png"),
 image("./images/black_knight.png"), image("./images/black_bishop.png"),
 image("./images/black_queen.png"), image("./images/black_king.png"),7,8,9,10,
 image("./images/white_pawn.png"), image("./images/white_tower.png"),
 image("./images/white_knight.png"), image("./images/white_bishop.png"),
 image("./images/white_queen.png"), image("./images/white_king.png")];

image.loaded = 0;
function image(src) {
  let img = new Image();
  img.src = src;
  img.onload = function() {
      image.loaded += 1;
      if(image.loaded === 12) {
          init();
      }
  };
  return img;
}

function updateTimer() {
    if(teamPlaying === team) {
        time--;
        if(time < 0) {
            time = 0;
        }
        document.getElementById("timer").innerHTML = time;
    } else {
        time = BASE_TIME;
        document.getElementById("timer").innerHTML = "Waiting on opponents";
    }
}

function init() {
    let canvas = document.getElementById("chessboard");
    let ctx = canvas.getContext("2d");
    ctx.font = "20px Arial";
    chessRenderer = new renderer(canvas, ctx);
    chessRenderer.renderBoard();
    let name = "";
    while(name === "") {
        name = prompt("Please enter your nickname");
    }
    if(name == null) {
        window.location.replace("http://google.com");
        return;
    }
    canvas.addEventListener("mousemove", function(evt) {
            mouseCoord = getMousePos(canvas, evt);
    }, false);
    setInterval(updateTimer, 1000);
    connect(name);
    return ctx;
}

function handleClick() {
    chessRenderer.refreshGame(engine.board, images);
    let y = Math.floor(mouseCoord.y / tileSize);
    let x = Math.floor(mouseCoord.x / tileSize);
    let selected = engine.board[y][x];
    let moves = engine.getAllPossibleMoves(newCell(y, x));
    if(selected.color === team) {
        if(moves !== undefined) {
            moves.forEach(function(move) {
                chessRenderer.highlightTile(move.y, move.x, (engine.board[move.x][move.y].piece !== PieceType.EMPTY));
            });
        }
    }
    let voteOK = false;
    //if we clicked an empty tile or an enemy tile, and we had a piece selected, and the piece had possible moves
    if(selected.piece === PieceType.EMPTY || selected.color !== team) {
        if(selectedPiece.piece !== PieceType.EMPTY && selectedPiece.color === team) {
            if(lastMoves !== undefined) {
                //check if selected tile is part of the possible moves
                lastMoves.forEach(function(move) {
                    if(move.x === y && move.y === x) {
                        voteOK = true;
                    }
                });

                if(voteOK) {
                    sendMove(lastY, lastX, y, x);
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
        document.getElementById("info").innerHTML += "<li id=\""+player.name+"\" class=\""+getTeamName(player.team)+"\">"+player.name+"</li>";
    }
}

function applyMove(mv) {
    engine.move(mv);
    chessRenderer.refreshGame(engine.board, images);
}

function setPlayerList(lst) {
    lst.forEach(function(player) {
        document.getElementById("info").innerHTML += "<li id=\""+player.name+"\" class=\""+getTeamName(player.team)+"\">"+player.name+"</li>";
    });
}

function teamChange(team) {
    teamPlaying = team;
    addToChat("Server", `It is now ${getTeamName(team)}'s turn.`);
    document.getElementById("turn").innerHTML = getTeamName(team)+"'s turn";
}

function onMessageReceived(msg) {
    let message = JSON.parse(msg.data).message;
    switch(message.type) {
        case messageType.ID:
            id = message.params;
            break;
        case messageType.NEW_PLAYER:
            let player = message.params;
            addPlayer(player);
            break;
        case messageType.INCOMING_CHAT:
            addToChat(message.params.sender, message.params.message);
            break;
        case messageType.BOARD:
            engine = getNewGame();
            engine.setBoard(message.params);
            chessRenderer.refreshGame(engine.board, images);
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
        case messageType.CHANGE:
            teamChange(message.params);
            break;
    }
}

function sendMove(bx, by, tx, ty) {
    let move = newMove(newCell(bx, by), newCell(tx, ty));
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
