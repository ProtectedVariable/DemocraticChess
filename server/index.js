"use strict";
const webSocket = require("ws");
const comm = require("../common/communication.js");
const chess = require("../common/ChessMotor.js");
const logger = require("log");
const ip = require("ip");

let log = new logger("debug");

const server = new webSocket.Server({port: 8080, family: 4});
log.info(`Server is alive on IP ${ip.address()}`);

let clients = [];
let votes = [];

let engine = chess.getNewGame();

let waiting = true;
let currentTeam = undefined;

setTimeout(sendWaitingMessage, 1000 * 10);

let turnTimeOut = setTimeout(chooseVote, 1000 * 60);

//TODO at end of the game, show result, open chat to everybody, and after 1 minute, reset the game

function chooseVote() {
    if (votes.length === 0) {
        //current team forfeits
    } else {
        //we choose the best vote

    }
}

function switchTeam() {
    if (currentTeam === undefined) {
        currentTeam = chess.PieceColor.WHITE;
    } else {
        currentTeam = currentTeam === chess.PieceColor.WHITE ? chess.PieceColor.BLACK : chess.PieceColor.WHITE;
    }
    //after each turn, player waiting to play can play
    clients.forEach(c => {
        if (c.player.name !== undefined && c.player.waiting) {
            c.player.waiting = false;
            c.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.PLAY, undefined)));
        }
    });
    broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.CHANGE, currentTeam)));
    turnTimeOut = setTimeout(chooseVote, 1000 * 60)
}


function vote(player, move) {
    return {player, move};
}


function doWeWait() {
    let oldWaiting = waiting;
    waiting = clients.length === 1 || clients.every(client => client.player.team === chess.PieceColor.BLACK) || clients.every(client => client.player.team === chess.PieceColor.WHITE);
    if (oldWaiting && !waiting) {
        switchTeam();
    }
    log.info(`NEED TO WAIT: ${waiting}`);
}

function sendWaitingMessage() {

    if (waiting) {
        broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(undefined, "Waiting for another player"))));
    }
    //launch if one team is empty as well
    setTimeout(sendWaitingMessage, 1000 * 10);
}


//TODO: add keep alive detection

function client(socket, id, player) {
    return {socket, id, player};
}

function player(pseudo) {
    let user = {name: pseudo, team: undefined, waiting: true};

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
            //TODO try-catch in case of multiple close at the same time
            client.socket.send(communication);
        }
    })
}

function broadcastToTeam(communication, team) {
    let members = clients.filter(client => client.player.team === team && client.player.name !== undefined);
    members.forEach(member => member.socket.send(communication));
}

function parseMessage(data) {

    let content = JSON.parse(data);

    let id = content.id;
    let message = content.message;

    if (clients[id] !== undefined) {
        let client = clients[id];
        let player = client.player;

        if (message.type === comm.messageType.NAME) {
            //we could check if it has already a name
            //TODO check if we already have a user with the same name and send a flag back
            let name = message.params.trim();
            log.info(`Trying name ${name}`);
            if (clients.some(client => client.player.name === name) || name === "") {
                log.info(`Name ${name} is already taken`);
                client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.PSEUDO_TAKEN, undefined)))
            } else {
                player.name = name;
                log.info(`New player for id ${id} is ${player.name} of team ${player.team}`);
                client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.PSEUDO_OK, undefined)));
                broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.NEW_PLAYER, player)));

                //send initial info about the game
                //TODO check if we send board or engine here

                log.info(`Sending board to ${player.name}`);
                client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.BOARD, engine.board)));


                //sending player list
                log.info(`Sending player list to ${player.name}`);
                let playersList = clients.map(client => client.player).filter(player => player.name !== undefined);
                client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.LIST, playersList)));

                //sending team to player
                log.info(`Sending team to player ${player.name}`);
                client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.TEAM, player.team)));

                //reevaluating if we need to wait


                doWeWait();
            }

        } else if (message.type === comm.messageType.MOVE && client.player.name !== undefined && !client.player.waiting) {
            //This is a vote for movement
            //redirect to all for now

            if (client.player.team === currentTeam && !waiting) {
                let movement = message.params;
                let possibleMoves = engine.getAllPossibleMoves(movement.startCell, false);
                if (possibleMoves.some(cell => (cell.x === movement.endCell.x && cell.y === movement.endCell.y))) {

                    //the move is valid
                    log.info(`Received a valid move, sending it to players`);

                    //TODO player arriving in the middle of a turn can only play during next turn

                    log.info(`Making the move on the server`);
                    engine.move(movement);
                    broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.MOVED, movement)));
                    broadcastToTeam(comm.communication(-1, comm.newMessage(comm.messageType.NEW_VOTE, movement)));

                    let isCheck = engine.checkCheck((currentTeam + 1) % 2);

                    if (isCheck) {
                        let isCheckMate = engine.checkCheckMate((currentTeam + 1) % 2);
                        broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(undefined, `${isCheckMate ? "Checkmate" : "Check"}`))));
                        if (isCheckMate) {
                            broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.RESULT, currentTeam)));
                        }
                    }

                    //TODO switch team now
                    switchTeam();
                    log.info(`Switching to team ${currentTeam}`);
                } else {
                    log.warning("Move not accepted")
                }

                /*


                //the move is valid
                let indexOfUserVote = votes.find(vote => vote.move === movement);
                let theVote = vote(player, movement);
                if (indexOfUserVote === undefined) {
                    //we create a new vote
                    votes.push(theVote);
                } else {
                    //we replace its last vote if it already had one
                    votes[indexOfUserVote] = theVote;
                }

                if (votes.length === currentTeam.length) {
                    //we can switch directly and make the most voted move
                    clearTimeout(turnTimeOut);
                    chooseVote();
                }
                */


            }

            //TODO we should think about voting for choice of promotion transformation


        } else if (message.type === comm.messageType.CHAT && client.player.name !== undefined) {
            //This is a chat from a client
            log.info(`New message from ${player.name}: ${message.params}`);
            broadcastToTeam(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(player, message.params))), player.team);
        }

    }

}


server.on("connection", (ws) => {

    //On connection, will join team and add to player list (assign team)
    //Generate a random ID and send it, so the client will send it with their messages
    //On disconnect, remove from team
    let id = clients.length;
    let user = client(ws, id, player(undefined));
    clients.push(user);

    ws.on("message", parseMessage);
    ws.on("close", () => {
        clients.forEach((client, index) => {
            if (client.socket === ws) {
                log.info(`Player ${client.player.name} with id ${id} disconnected`);
                broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.PLAYER_LEFT, client.player)));
                clients.splice(index, 1);
                //reevaluating if we need to wait
                doWeWait();
            }
        });
        if (clients.length === 0) {
            log.info("Everybody left, resetting the board");
            engine = chess.getNewGame();
        }
    });
    log.info(`New connection from ${user.id}`);
    ws.send(comm.communication(-1, comm.newMessage(comm.messageType.ID, user.id)));
});
