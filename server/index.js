/**
 * @file server/index.js
 * @brief Source file containing the websocket server for Democratic Chess
 *
 * @authors Maxime Lovino, Thomas Ibanez, Vincent Tournier
 * @date September 6, 2017
 * @version 1.0
 */

"use strict";
const webSocket = require("ws");
const comm = require("../common/communication.js");
const chess = require("../common/ChessMotor.js");
const logger = require("log");
const ip = require("ip");
const uuid = require("uuid/v1");

const log = new logger("debug");

const server = new webSocket.Server({port: 8080, family: 4});
log.info(`Server is alive on IP ${ip.address()}`);

let clients = [];
let clientsByID = {};
let votes = {};
let votesCount = 0;
const turnTime = chess.BASE_TIME * 1000;
const waitingCheckTime = 1000 * 10;

let engine = chess.getNewGame();

let waiting = true;
let currentTeam = undefined;

setTimeout(sendWaitingMessage, waitingCheckTime);

let turnTimeOut;

//TODO notify on browser when team change https://developer.mozilla.org/en-US/docs/Web/API/notification
//TODO display chat commands on chat
//TODO colorize messages differently according to scope (server to clients, clients to team, clients to everyone), perhaps send 3 different types from server according to the message type
//TODO scrollable player list

//TODO display something bigger on victory, use RESULT message as well to do something


//TODO Check on close on client

//TODO kick anyone who doesn't vote after 3 times
//TODO add time sync messages
//TODO at end of the game, show result, open chat to everybody, and after 1 minute, reset the game

function weightedCountVote(voteArray) {
    if (voteArray.length === 0) return 0;
    return voteArray.reduce((sum, y) => sum + y.points, 0);
}

function vote(player, move) {
    return {player, move};
}

function assignNewPoints(voteArray) {
    voteArray.forEach((player, index) => player.points += (voteArray.length - index));
}

function sendListOfPlayers() {
    let playersList = clients.map(client => client.player).filter(player => player.name !== undefined);
    playersList.sort((a, b) => {
        if (a.team < b.team) {
            return 1;
        } else if (a.team > b.team) {
            return -1;
        } else {
            if (a.points > b.points) {
                return -1;
            } else {
                return 1;
            }
        }
    });
    broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.LIST, playersList)));
}

function sortVotes(keyArray) {
    keyArray.sort((a, b) => {
        if (votes[a] < votes[b]) {
            return 1;
        } else if (votes[a] > votes[b]) {
            return -1;
        } else {
            if (weightedCountVote(votes[a]) > weightedCountVote(votes[b])) {
                return -1;
            } else {
                return 1;
            }
        }
    });
}

function chooseVote() {
    if (votesCount === 0) {
        //current team forfeits
        log.error(`No vote were made by team ${currentTeam}, kicking everybody`);
        broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(undefined, `Kicking team that didn't play`))));
        clients.forEach((c) => {
            if (c.player.team === currentTeam) {
                log.info(`Kicking user ${c.player.name}`);
                c.socket.close();
                clientsByID[c.id] = undefined;
            } else {
                log.info(`NOT kicking ${c.player.name} because is of team ${c.player.team}`);
            }
        });
        //This should work
        clients = clients.filter(c => c.player.team !== currentTeam);
        sendListOfPlayers();
        resetGame();
    } else {
        //we choose the best vote
        log.info("Choosing what move to make");
        let keys = Object.keys(votes);
        sortVotes(keys);
        let bestMoveString = keys[0];
        log.info(`We chose the move: ${bestMoveString}`);
        let moveToMake = JSON.parse(bestMoveString);
        assignNewPoints(votes[bestMoveString]);
        sendListOfPlayers();
        log.info(`Making the move on the server`);
        engine.move(moveToMake);
        if (moveToMake.promotion !== undefined) {
            if(!engine.promotePawn(moveToMake.endCell, moveToMake.promotion)) {
                moveToMake.promotion = undefined;
            }
        }
        broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.MOVED, moveToMake)));
        let isCheck = engine.checkCheck((currentTeam + 1) % 2);

        if (isCheck) {
            let isCheckMate = engine.checkCheckMate((currentTeam + 1) % 2);
            broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(undefined, `${isCheckMate ? "Checkmate" : "Check"}`))));
            if (isCheckMate) {
                broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.RESULT, currentTeam)));
                broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(undefined, "Resetting in 5 seconds"))));
                setTimeout(resetGame, 5 * 1000);
            }
        }

        votesCount = 0;
        votes = {};
        switchTeam();
        log.info(`Switching to team ${currentTeam}`);
    }
}

function switchTeam() {
    if (currentTeam === undefined) {
        currentTeam = chess.PieceColor.WHITE;
    } else {
        currentTeam = currentTeam === chess.PieceColor.WHITE ? chess.PieceColor.BLACK : chess.PieceColor.WHITE;
    }
    //after each turn, players waiting to play can play
    clients.forEach(c => {
        if (c.player.name !== undefined && c.player.waiting) {
            c.player.waiting = false;
            c.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.PLAY, undefined)));
        }
    });
    broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.CHANGE, currentTeam)));
    turnTimeOut = setTimeout(chooseVote, turnTime)
}


function doWeWait() {
    let oldWaiting = waiting;
    let realPlayers = clients.filter(c => c.player.name !== undefined);
    waiting = realPlayers.length === 1 || realPlayers.every(client => client.player.team === chess.PieceColor.BLACK) || realPlayers.every(client => client.player.team === chess.PieceColor.WHITE);
    if (oldWaiting && !waiting) {
        switchTeam();
    }

    if (!oldWaiting && waiting) {
        currentTeam = undefined;
        clearTimeout(turnTimeOut);
    }
    log.info(`NEED TO WAIT: ${waiting}`);
}

function sendWaitingMessage() {

    if (waiting) {
        broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(undefined, "Waiting for another player"))));
    }
    //launch if one team is empty as well
    setTimeout(sendWaitingMessage, waitingCheckTime);
}


//TODO: add keep alive detection

function client(socket, id, player) {
    return {socket, id, player};
}

function player(pseudo) {
    let user = {name: pseudo, team: undefined, waiting: true, points: 1};

    //TODO we should call pick team after choosing the name perhaps, not at the creation of the user
    function pickTeam() {
        //or team with less people
        let numberOfWhites = clients.filter(client => client.player.team === chess.PieceColor.WHITE).length;

        if (numberOfWhites > 0.5 * clients.length) {
            user.team = chess.PieceColor.BLACK;
        } else if (numberOfWhites < 0.5 * clients.length) {
            user.team = chess.PieceColor.WHITE;
        } else {
            user.team = Math.random() > 0.5 ? chess.PieceColor.WHITE : chess.PieceColor.BLACK;
        }
    }


    pickTeam();

    return user;
}


function broadcastToAll(communication) {
    clients.forEach(client => {
        if (client.socket.readyState === webSocket.OPEN && client.player.name !== undefined) {
            try {
                client.socket.send(communication);
            } catch (e) {
                log.error(`Couldn't send to a client, got error : ${e}`);
            }
        }
    })
}

function broadcastToTeam(communication, team) {
    let members = clients.filter(client => client.player.team === team && client.player.name !== undefined);
    members.forEach(member => {
        try {
            member.socket.send(communication)
        } catch (e) {
            log.error(`Couldn't send to a client, got error : ${e}`);
        }
    });
}

function parseMessage(data) {

    let content = JSON.parse(data);

    let id = content.id;
    let message = content.message;

    if (clientsByID[id] !== undefined) {
        let client = clientsByID[id];
        let player = client.player;

        if (message.type === comm.messageType.NAME) {
            //we could check if it has already a name
            let name = message.params.trim();
            log.info(`Trying name ${name}`);
            if (clients.some(client => client.player.name === name) || name === "" || name === "server" || name === "Server") {
                log.info(`Name ${name} is already taken`);
                client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.PSEUDO_TAKEN, undefined)))
            } else {
                //TODO set client.player here directly and it's undefined until then
                player.name = name;
                log.info(`New player for id ${id} is ${player.name} of team ${player.team}`);
                client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.PSEUDO_OK, undefined)));
                broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.NEW_PLAYER, player)));

                //send initial info about the game

                log.info(`Sending board to ${player.name}`);
                client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.BOARD, engine.board)));


                //sending player list
                log.info(`Sending new player list to everybody`);
                sendListOfPlayers();

                //sending team to player
                log.info(`Sending team to player ${player.name}`);
                client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.TEAM, player.team)));

                //reevaluating if we need to wait


                doWeWait();
            }

        } else if (message.type === comm.messageType.MOVE && client.player.name !== undefined && !client.player.waiting) {
            //This is a vote for movement

            if (client.player.team === currentTeam && !waiting) {
                let movement = message.params;
                let possibleMoves = engine.getAllPossibleMoves(movement.startCell, false);
                if (possibleMoves.some(cell => (cell.x === movement.endCell.x && cell.y === movement.endCell.y))) {

                    //the move is valid
                    log.info(`Received a valid move, gonna consider this vote`);


                    log.info("Collecting vote");
                    let movementKey = JSON.stringify(movement);

                    //deleting old vote for player if already had one
                    for (let key in votes) {
                        let index = votes[key].find(p => p.name === player.name);
                        if (index !== undefined) {
                            log.info(`Vote already found for ${player.name}, removing it...`);
                            votes[key].splice(index, 1);
                            votesCount -= 1;
                            broadcastToTeam(comm.communication(-1, comm.newMessage(comm.messageType.DEL_VOTE, vote(player, JSON.parse(key)))), player.team);
                        }
                    }

                    //creating new vote
                    log.info(`Registering new vote for ${player.name}`);
                    if (votes[movementKey] !== undefined) {
                        log.info(`Move already voted by someone else, adding to counter`);
                        votes[movementKey].push(player);
                    } else {
                        log.info(`New move created`);
                        votes[movementKey] = [player];
                    }
                    votesCount += 1;
                    broadcastToTeam(comm.communication(-1, comm.newMessage(comm.messageType.NEW_VOTE, vote(player, movement))), player.team);


                    if (votesCount === clients.filter(c => c.player.team === currentTeam && !c.player.waiting).length) {
                        //everybody voted
                        log.info(`Everybody voted`);
                        clearTimeout(turnTimeOut);
                        chooseVote();
                    }


                } else {
                    log.warning("Move not accepted")
                }


            }

            //TODO we should think about voting for choice of promotion transformation => perhaps we can keep it like that, where you vote for all at the same time, only client-side


        } else if (message.type === comm.messageType.CHAT && client.player.name !== undefined) {
            //This is a chat from a client
            let chatContent = message.params;
            log.info(`New message from ${player.name}: ${chatContent}`);

            if (chatContent.startsWith("/s")) {
                chatContent = chatContent.substr(2).trim();
                broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(player, chatContent))));
            } else {
                broadcastToTeam(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(player, chatContent))), player.team);
            }
        }

    }

}


function resetGame() {
    //TODO white should start again, send player list, perhaps put team to undefined and it will work out
    log.info("Resetting the board and points for everybody");
    clients.forEach(c => c.player.points = 1);
    engine = chess.getNewGame();
    broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.CHAT, comm.chat(undefined, "Resetting the game"))));
    sendListOfPlayers();
    broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.BOARD, engine.board)));
    doWeWait();
}

server.on("connection", (ws) => {
    let id = uuid();

    let user = client(ws, id, player(undefined));
    clientsByID[id] = user;
    clients.push(user);

    ws.on("message", parseMessage);
    ws.on("close", () => {
        clients.forEach((client, index) => {
            if (client.socket === ws) {
                log.info(`Player ${client.player.name} with id ${client.id} disconnected`);
                //TODO join team only after having a name?
                if (client.player.name !== undefined) {
                    broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.PLAYER_LEFT, client.player)));
                } else {
                    log.info("Not broadcasting leaving because it hasn't a name");
                }
                clients.splice(index, 1);
                clientsByID[client.id] = undefined;
                sendListOfPlayers();
                //reevaluating if we need to wait
                doWeWait();
            }
        });
        let realPlayers = clients.filter(c => c.player.name !== undefined);
        if (clients.length === 0 || realPlayers.every(client => client.player.team === chess.PieceColor.BLACK) || realPlayers.every(client => client.player.team === chess.PieceColor.WHITE)) {
            resetGame();
        }
    });
    log.info(`New connection from ${user.id}`);
    ws.send(comm.communication(-1, comm.newMessage(comm.messageType.ID, user.id)));
});
