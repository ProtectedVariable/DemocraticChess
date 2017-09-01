"use strict";
const webSocket = require("ws");
const comm = require("../common/communication.js");
const chess = require("../common/ChessMotor.js");
const logger = require("log");
const ip = require("ip");

let log = new logger("debug");

const server = new webSocket.Server({port: 8080, family: 4});
console.info(`Server is alive on IP ${ip.address()}`);

let clients = [];

let board = chess.getNewGame();
setTimeout(sendWaitingMessage, 1000 * 10);

function sendWaitingMessage() {
    if (clients.length === 1 || clients.filter(client => client.player.team === chess.PieceColor.BLACK).length === 0 || clients.filter(client => client.player.team === chess.PieceColor.WHITE).length === 0) {
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
            client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.BOARD, board)));


            //sending player list
            log.info(`Sending player list to ${player.name}`);
            let playersList = clients.map(client => client.player);
            client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.LIST, playersList)));

            //sending team to player
            log.info(`Sending team to player ${player.name}`);
            client.socket.send(comm.communication(-1, comm.newMessage(comm.messageType.TEAM, player.team)));


        } else if (message.type === comm.messageType.MOVE) {
            //This is a vote for movement
            //redirect to all for now

            //TODO move in our instance of the board
            log.info(`Received a move ${message.params}`);
            broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.MOVED, message.params)));


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
            }
        });
        if (clients.length === 0) {
            board = chess.getNewGame();
        }
    });
    log.info(`New connection from ${user.id}`);
    ws.send(comm.communication(-1, comm.newMessage(comm.messageType.ID, user.id)));
});