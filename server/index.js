"use strict";
const webSocket = require("ws");
const comm = require("../common/communication.js");
const chess = require("../common/ChessMotor.js");

const server = new webSocket.Server({port: 8080, family: 4});

let clients = [];


//TODO: Store board/engine here, clear board only at start of server or when there's nobody left

//TODO: add keep alive detection

function client(socket, id, player) {
    let user = {socket,id,player};
    return user;
}

//TODO We should have a client object that contains the socket, id and a player object
//The player object would contain all public info (sent to clients), like name, team and score

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
    console.log(content);

    let id = content.id;
    let message = content.message;
    console.log(message);
    //console.log(players[id]);

    if (clients[id] !== undefined) {
        console.log("VALID");
        let player = clients[id].player;

        if (message.type === comm.messageType.NAME) {
            //we could check if it has already a name
            player.name = message.params;
            console.log(`New player for id ${id} is ${player.name} of team ${player.team}`);
            broadcastToAll(comm.communication(-1, comm.newMessage(comm.messageType.NEW_PLAYER, player)));
        } else if (message.type === comm.messageType.MOVE) {
            //This is a vote for movement
        } else if (message.type === comm.messageType.CHAT) {
            //This is a chat from a client
            console.log(`New message from ${player.name}: ${message.params}`);
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
        clients.forEach(client => {
            if (client.socket === ws) {
                //send player left message and remove from array
                console.log(`Player with id ${id} disconnected`);
            }
        })
    });
    console.log(`New connection from ${user.id}`);
    ws.send(comm.communication(-1, comm.newMessage(comm.messageType.ID, user.id)));
});