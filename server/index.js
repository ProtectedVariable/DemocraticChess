const webSocket = require('ws');

const server = new webSocket.Server({port: 8080});

var players = [];


function player(pseudo,team) {

}

function pickRandomTeam() {

}


function parseMessage(message) {
    /*
    Syntax for messages:

    Client -> Server:

    Move vote: MOVE_<StartCell><EndCell> (can receive more than one per people, so we count the last one)
    Show available cells: CLICK_<Cell>
    First message after connection : pseudo

    Server -> client:

    Team assignment: TEAM_<white/black>
    Move done: MOVED_<StartCell><EndCell>
    Result: RESULT_<white/black>
    Response to available cells: AVAILABLE_<listOfCells>
    Timeout (or all votes done): TIMEOUT_<teamToPlay>
    Board (send all board at the current state): BOARD_<Array>
     */








    console.log(`${client}: ${message}`);
}


server.on('connection', function connection(ws, req) {
    //On connection, will join team and add to player list (assign team)
    //On disconnect, remove from team
    client = req.connection.remoteAddress;
    ws.on('message', parseMessage);
    console.log(`New connection from ${client}`);
    ws.send(`Thanks for connecting ${client}`);
});