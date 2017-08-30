"use strict";
const webSocket = require("ws");
const comm = require("../common/communication.js");
const chess = require("../common/chess.js");

const server = new webSocket.Server({port: 8080, family: 4});

var players = [];


function player(socket, id, pseudo) {
    let user = {socket: socket, id: id, name: pseudo, team: undefined};

    function pickTeam() {
        //or team with less people
        let numberOfWhites = players.filter(player => player.team === chess.PieceColor.WHITE).length;

        if (numberOfWhites > 0.5 * players.length) {
            user.team = chess.PieceColor.BLACK;
        } else if (numberOfWhites < 0.5 * players.length) {
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
    let members = players.filter(player => player.team === team);

    members.forEach(member => member.socket.send(communication));
}

function parseMessage(data) {

    let content = JSON.parse(data);
    console.log(content);

    let id = content.id;
    let message = content.message;
    console.log(message);
    //console.log(players[id]);

    if (players[id] !== undefined) {
        console.log("VALID");
        let player = players[id];

        if (message.type === comm.messageType.NAME) {
            //we could check if it has already a name
            player.name = message.params;
            console.log(`New player for id ${id} is ${player.name} of team ${player.team}`);
            //change this to send player object but without critical info (like socket and ID)
            broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.NEW_PLAYER, [player.name, player.team])));
        } else if (message.type === comm.messageType.MOVE) {
            //This is a vote for movement
        } else if (message.type === comm.messageType.CHAT) {
            //This is a chat from a client
            console.log(`New message from ${player.name}: ${message.params}`);
            broadcastToTeam(comm.communication(-1, comm.newMessage(comm.messageType.INCOMING_CHAT, comm.chat(player, message.params))), player.team);
        }

    }

}


server.on("connection", function connection(ws, req) {

    //On connection, will join team and add to player list (assign team)
    //Generate a random ID and send it, so the client will send it with their messages
    //On disconnect, remove from team
    let id = players.length;
    let user = player(ws, id, undefined);
    players.push(user);

    ws.on("message", parseMessage);
    ws.on("close", closeEvent => {
        players.forEach(player => {
            if (player.socket === ws) {
                //send player left message and remove from array
                console.log(`Players with id ${id} disconnected`);
            }
        })
    });
    console.log(`New connection from ${user.id}`);
    ws.send(comm.communication(-1, comm.newMessage(comm.messageType.ID, user.id)));
});