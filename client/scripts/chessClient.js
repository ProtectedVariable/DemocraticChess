/**
 * @file client/chessClient.js
 * @brief Source file containing the client-side application main functions
 *
 * @authors Thomas Ibanez, Maxime Lovino, Vincent Tournier
 * @date September 6, 2017
 * @version 1.0
 */
"use strict";

const PLAY_PAGE = `<div class="left">
    <div id="playbanner"></div>
    <div id="chat"></div>
    <input id="message" type="text" placeholder="Type your message here" onkeypress="client.handleChatMessage(event, 'message')"/>
</div>
<div class="center">
    <canvas id="chessboard" width="698" height="682" onclick="client.handleClick()"></canvas>
</div>
<div class="right">
    <div id="turn">
    </div>
    <ul id="info">
    </ul>
    <div id="timer">Waiting for next turn</div>
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
    let context = canvas.getContext("2d");
    client.chessRenderer = new chessRenderer(canvas, context);
    client.voteRenderer = new voteRenderer(context);
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
        voteRenderer : undefined,
        team : undefined,
        id : -1,
        name : "",
        engine : undefined,
        mouseCoord : undefined,
        selectedPiece : undefined,
        lastMoves : undefined,
        lastX : undefined,
        lastY : undefined,
        time : BASE_TIME,
        playing : false,
        teamPlaying : -1,

        updateTimer : function() {
            if(this.playing) {
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
            }
        },

        handleClick : function() {
            if(this.playing) {
                this.chessRenderer.refreshGame(this.engine.board, images);
                this.updateCheck();
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
                                if((x === 0 || x === 7) && this.selectedPiece.piece === PieceType.PAWN) {

                                }
                                this.socketClient.sendMove(this.lastY, this.lastX, y, x);
                            }
                        }
                    }
                }
                this.voteRenderer.renderVotes();
                this.lastX = x;
                this.lastY = y;
                this.selectedPiece = selected;
                this.lastMoves = moves;
            }
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
        },

        addPlayer : function(player) {
            this.addToChat("Server", "Player "+player.name+" has joined team "+this.getTeamName(player.team));
        },

        applyMove : function(mv) {
            this.engine.move(mv);
            this.voteRenderer.clearVotes();
            this.chessRenderer.refreshGame(this.engine.board, images);
            this.updateCheck();
        },

        setPlayerList : function(lst) {
            document.getElementById("info").innerHTML = "";
            lst.forEach(function(player) {
                document.getElementById("info").innerHTML += "<li id=\"pl"+player.name+"\" class=\""+this.getTeamName(player.team)+"\">"+player.name+" - "+player.points+"</li>";
            }, this);
        },

        updateCheck : function() {
            let wx = 0;
            let wy = 0;
            let bx = 0;
            let by = 0;
            let x = 0;
            let y = 0;
            while(x < 8 && y < 8) {
                if(this.engine.board[x][y].piece === PieceType.KING) {
                    if(this.engine.board[x][y].color === PieceColor.BLACK) {
                        bx = x;
                        by = y;
                    } else {
                        wx = x;
                        wy = y;
                    }
                }
                x += 1;
                if(x >= 8) {
                    y += 1;
                    x = 0;
                }
            }
            if(this.engine.checkCheck(PieceColor.BLACK)) {
                this.chessRenderer.checkTile(bx, by, PieceColor.BLACK);
            }
            if(this.engine.checkCheck(PieceColor.WHITE)) {
                this.chessRenderer.checkTile(wx, wy, PieceColor.WHITE);
            }
        },

        updateVotes : function(vote, add) {
            if(add) {
                this.voteRenderer.addVote(vote.move);
                document.getElementById("pl"+vote.player.name).innerHTML = vote.player.name+" - "+vote.player.points + "    <span style=\"color:"+this.voteRenderer.getVoteColor(vote.move)+"\">▬▬▬</span>"
            } else {
                this.voteRenderer.removeVote(vote.move);
                document.getElementById("pl"+vote.player.name).innerHTML = vote.player.name+" - "+vote.player.points;
            }
            this.chessRenderer.refreshGame(this.engine.board, images);
            let moves = this.engine.getAllPossibleMoves(newCell(this.lastY, this.lastX));
            if(this.selectedPiece !== undefined && this.selectedPiece.color === this.team) {
                if(moves !== undefined) {
                    moves.forEach(function(move) {
                        this.chessRenderer.highlightTile(move.y, move.x, (this.engine.board[move.x][move.y].piece !== PieceType.EMPTY));
                    }, this);
                }
            }
            this.updateCheck();
            this.voteRenderer.renderVotes();
        },

        teamChange : function(team) {
            this.teamPlaying = team;
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
            document.getElementById("playbanner").innerHTML = client.name +" - "+client.getTeamName(client.team);
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
        case messageType.PLAY:
            client.playing = true;
            break;
        case messageType.DEL_VOTE:
            client.updateVotes(message.params, false);
            break;
        case messageType.NEW_VOTE:
            client.updateVotes(message.params, true);
            break;
        default:
            console.log(message);
            break;
    }
}