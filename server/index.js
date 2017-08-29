const webSocket = require('ws');

const server = new webSocket.Server({port: 8080, family: 4});

var players = [];


function player(id, pseudo) {
    let user = {id: id, name: pseudo, team: undefined};

    function pickRandomTeam() {
        //or team with less people
        //user.team = Math.random() > 0.5 ? PieceColor.WHITE : PieceColor.BLACK;
        user.team = Math.random() > 0.5 ? "white" : "black";
    }

    pickRandomTeam();

    return user;
}


function broadcast(message) {
    server.clients.forEach(client => {
        if (client !== server && client.readyState === webSocket.OPEN) {
            client.send(message);
        }
    })
}

function parseMessage(data) {

    /*
    Syntax for messages:

    Client -> Server:

    Move vote: MOVE_<StartCell><EndCell> (can receive more than one per people, so we count the last one)
    First message after connection : NAME_<name>
    Chat message: CHAT_<message>

    Server -> client:

    (after connection)
    Team assignment: TEAM_<white/black>
    Board (send all board at the current state): BOARD_<Array>
    PlayerList: LIST_<list of players>

    New vote: VOTE_<StartCell><EndCell>
    Move done: MOVED_<StartCell><EndCell>
    Result: RESULT_<white/black>
    Timeout (or all votes done): TIMEOUT_<teamToPlay>
    NewChat: CHAT_<source>_<message>
    NewPlayerJoined: PLAYER_<name><white/black>
     */

    console.log(data);

    let object = JSON.parse(data);

    let id = object.id;
    let message = object.message;
    console.log(players[id]);

    if (id < players.length) {
        let player = players[id];

        if (message.startsWith("NAME_")) {
            //we could check if it has already a name
            player.name = message.substr("NAME_".length).trim();
            console.log(`New player for id ${id} is ${player.name}`);
            broadcast(`PLAYER_${player.name}_${player.team}`);
        }

    }

}


server.on('connection', function connection(ws, req) {

    //On connection, will join team and add to player list (assign team)
    //Generate a random ID and send it, so the client will send it with their messages
    //On disconnect, remove from team
    let id = players.length;
    let user = player(id, undefined);
    players.push(user);

    ws.on('message', parseMessage);
    console.log(`New connection from ${user.id}`);
    ws.send(`ID_${id}`);
});