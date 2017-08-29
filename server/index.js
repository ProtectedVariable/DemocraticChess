const webSocket = require('ws');

const server = new webSocket.Server({port: 8080});

var client = undefined;

function parseMessage(message) {
    console.log(`${client}: ${message}`);
}


server.on('connection', function connection(ws, req) {
    client = req.connection.remoteAddress;
    ws.on('message', parseMessage);
    console.log(`New connection from ${client}`);
    ws.send(`Thanks for connecting ${client}`);
});