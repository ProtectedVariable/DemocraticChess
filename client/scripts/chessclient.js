"use strict";

const PLAY_PAGE = `<div class="left">
    <div>Welcome to the chat room</div>
    <div id="chat"></div>
    <input id="message" type="text" placeholder="Type your message here" onkeypress="client.handleChatMessage(event, 'message')"/>
</div>
<div class="center">
    <canvas id="chessboard" width="678" height="682" onclick="client.handleClick()"></canvas>
</div>
<div class="right">
    <div id="turn">
    </div>
    <ul id="info">
    </ul>
    <div id="timer">60</div>
</div>`;

let client = new chessClient();

function joinGame() {
    let name = document.getElementById("name").value;
    client.socketClient.sendName(name);
    client.name = name;
}

function nameOK() {
    document.body.innerHTML = PLAY_PAGE;
    let canvas = document.getElementById("chessboard");
    client.chessRenderer = new chessRenderer(canvas);
    setInterval(client.updateTimer.bind(client), 1000);
    canvas.addEventListener("mousemove", function(evt) {
            client.mouseCoord = client.getMousePos(canvas, evt);
    }, false);
}

function nameTaken() {
    document.getElementById("loginfo").innerHTML = "This name is already taken, please choose another one";
    document.getElementById("loginfo").style.display = "block";
}

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

const images = [0,image("./images/black_pawn.png"), image("./images/black_tower.png"),
 image("./images/black_knight.png"), image("./images/black_bishop.png"),
 image("./images/black_queen.png"), image("./images/black_king.png"),7,8,9,10,
 image("./images/white_pawn.png"), image("./images/white_tower.png"),
 image("./images/white_knight.png"), image("./images/white_bishop.png"),
 image("./images/white_queen.png"), image("./images/white_king.png")];


function init() {
    client.socketClient.connect(onMessageReceived);
}

function chessClient() {
    return {
        socketClient : new socketClient(),
        chessRenderer : undefined,
        team : undefined,
        id : -1,
        open : false,
        name : "",
        engine : undefined,
        mouseCoord : undefined,
        selectedPiece : undefined,
        lastMoves : undefined,
        lastX : undefined,
        lastY : undefined,
        time : 60,
        teamPlaying : -1,

        updateTimer : function() {
            if(this.teamPlaying === this.team) {
                this.time -= 1;
                if(this.time < 0) {
                    this.time = 0;
                }
                document.getElementById("timer").innerHTML = this.time;
            } else {
                this.time = BASE_TIME;
                document.getElementById("timer").innerHTML = "Waiting on opponents";
            }
        },

        handleClick : function() {
            this.chessRenderer.refreshGame(this.engine.board, images);
            let y = Math.floor(this.mouseCoord.y / tileSize);
            let x = Math.floor(this.mouseCoord.x / tileSize);
            let selected = this.engine.board[y][x];
            let moves = this.engine.getAllPossibleMoves(newCell(y, x));
            if(selected.color === this.team) {
                if(moves !== undefined) {
                    moves.forEach(function(move) {
                        this.chessRenderer.highlightTile(move.y, move.x, (this.engine.board[move.x][move.y].piece !== PieceType.EMPTY));
                    }, this);
                }
            }
            let voteOK = false;
            //if we clicked an empty tile or an enemy tile, and we had a piece selected, and the piece had possible moves
            if(selected.piece === PieceType.EMPTY || selected.color !== this.team) {
                if(this.selectedPiece.piece !== PieceType.EMPTY && this.selectedPiece.color === this.team) {
                    if(this.lastMoves !== undefined) {
                        //check if selected tile is part of the possible moves
                        this.lastMoves.forEach(function(move) {
                            if(move.x === y && move.y === x) {
                                voteOK = true;
                            }
                        });

                        if(voteOK) {
                            this.socketClient.sendMove(this.lastY, this.lastX, y, x);
                        }
                    }
                }
            }
            this.lastX = x;
            this.lastY = y;
            this.selectedPiece = selected;
            this.lastMoves = moves;
        },

        getMousePos : function(canvas, e) {
            let rect = canvas.getBoundingClientRect();
            return {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            };
        },

        getTeamName : function(i) {
            if(i === PieceColor.WHITE) {
                return "white";
            } else {
                return "black";
            }
        },

        addToChat : function(sender, message) {
            document.getElementById("chat").innerHTML += `<br/><b>${sender}</b>: ${message}`;
            document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
        },

        removePlayer : function(player) {
            this.addToChat("Server",`Player ${player.name} left`);
            let elem = document.getElementById(player.name);
            elem.parentNode.removeChild(elem);
        },

        addPlayer : function(player) {
            this.addToChat("Server", "Player "+player.name+" has joined team "+this.getTeamName(player.team));
            if(player.name !== this.name) {
                document.getElementById("info").innerHTML += "<li id=\""+player.name+"\" class=\""+this.getTeamName(player.team)+"\">"+player.name+"</li>";
            }
        },

        applyMove : function(mv) {
            this.engine.move(mv);
            this.chessRenderer.refreshGame(this.engine.board, images);
        },

        setPlayerList : function(lst) {
            lst.forEach(function(player) {
                document.getElementById("info").innerHTML += "<li id=\""+player.name+"\" class=\""+this.getTeamName(player.team)+"\">"+player.name+"</li>";
            }, this);
        },

        teamChange : function(team) {
            this.teamPlaying = team;
            this.addToChat("Server", `It is now ${this.getTeamName(team)}'s turn.`);
            document.getElementById("turn").innerHTML = this.getTeamName(team)+"'s turn";
        },

        handleChatMessage : function(e, tagId) {
            if(e.which === 13 || e.keyCode === 13) {
                let msg = document.getElementById(tagId).value;
                if(msg !== "") {
                    this.socketClient.socket.send(communication(this.socketClient.id, newMessage(messageType.CHAT, msg)));
                    document.getElementById(tagId).value = "";
                }
            }
        }
    };
}

function onMessageReceived(msg) {
    let message = JSON.parse(msg.data).message;
    switch(message.type) {
        case messageType.ID:
            client.socketClient.id = message.params;
            break;
        case messageType.PSEUDO_OK:
            nameOK();
            break;
        case messageType.PSEUDO_TAKEN:
            nameTaken();
            break;
        case messageType.NEW_PLAYER:
            let player = message.params;
            client.addPlayer(player);
            break;
        case messageType.INCOMING_CHAT:
            client.addToChat(message.params.sender, message.params.message);
            break;
        case messageType.BOARD:
            client.engine = getNewGame();
            client.engine.setBoard(message.params);
            client.chessRenderer.refreshGame(client.engine.board, images);
            break;
        case messageType.PLAYER_LEFT:
            let playerLeaving = message.params;
            client.removePlayer(playerLeaving);
            break;
        case messageType.TEAM:
            client.team = message.params;
            break;
        case messageType.MOVED:
            client.applyMove(message.params);
            break;
        case messageType.LIST:
            client.setPlayerList(message.params);
            break;
        case messageType.CHANGE:
            client.teamChange(message.params);
            break;
        default:
            console.log(message);
            break;
    }
}
