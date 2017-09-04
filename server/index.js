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
let currentTeam = chess.PieceColor.WHITE;

setTimeout(sendWaitingMessage, 1000 * 10);

let turnTimeOut = setTimeout(chooseVote, 1000 * 60);

function chooseVote() {
    if (votes.length === 0) {
        //current team forfeits
    }
}

function switchTeam() {
    currentTeam = currentTeam === chess.PieceColor.WHITE ? chess.PieceColor.BLACK : chess.PieceColor.WHITE;
    turnTimeOut = setTimeout(chooseVote, 1000 * 60)
}


function vote(player, move) {
    return {player, move};
}


function doWeWait() {
    waiting = clients.length === 1 || clients.every(client => client.player.team === chess.PieceColor.BLACK) || clients.every(client => client.player.team === chess.PieceColor.WHITE);
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
    let user = {socket, id, player};
    return user;
}

function player(pseudo) {
    let user = {name: pseudo, team: undefined};

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
    server.clients.forEach(client => {
        if (client !== server && client.readyState === webSocket.OPEN) {
            client.send(communication);
        }
    })
}

function broadcastToTeam(communication, team) {
    let members = clients.filter(client => client.player.team === team);
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
            player.name = message.params;
            log.info(`New player for id ${id} is ${player.name} of team ${player.team}`);
            broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.NEW_PLAYER, player)));

            //send initial info about the game
            //TODO check if we send board or engine here

            log.info(`Sending board to ${player.name}`);
            client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.BOARD, engine.board)));


            //sending player list
            log.info(`Sending player list to ${player.name}`);
            let playersList = clients.map(client => client.player);
            client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.LIST, playersList)));

            //sending team to player
            log.info(`Sending team to player ${player.name}`);
            client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.TEAM, player.team)));

            //reevaluating if we need to wait


            doWeWait();


        } else if (message.type === comm.messageType.MOVE) {
            //This is a vote for movement
            //redirect to all for now

            if (client.player.team == currentTeam && !waiting) {
                let movement = message.params;
                log.info(`Received a move, sending it to players`);
                broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.MOVED, movement)));

                if (engine.getAllPossibleMoves(movement.startCell).some(mv => mv === movement)) {
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
                }


                //TODO we should check the validity and collect the votes here
                log.info(`Making the move on the server`);
                engine.move(movement);

                //TODO switch team now
                switchTeam();
                broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.CHANGE, currentTeam)));
                log.info(`Switching to team ${currentTeam}`);
            }

            //TODO we should think about voting for choice of promotion transformation


        } else if (message.type === comm.messageType.CHAT) {
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
