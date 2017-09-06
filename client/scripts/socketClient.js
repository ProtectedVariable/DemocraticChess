"use strict";

const SERVER_URL = "ws://172.20.1.66:8080";

function socketClient() {
    return {
        socket: undefined,
        id: undefined,

        connect : function(callback) {
            this.socket = new WebSocket(SERVER_URL);
            this.socket.onmessage = callback;
            this.socket.onerror = function(e) {
                alert("An error occured, you are not connected");
                return;
            };
        },

        sendName : function(name) {
            if(this.id !== undefined) {
                this.socket.send(communication(this.id, newMessage(messageType.NAME, name)));
            } else {
                return false;
            }
        },

        sendMove : function(bx, by, tx, ty) {
            let move = newMove(newCell(bx, by), newCell(tx, ty));
            this.socket.send(communication(this.id, newMessage(messageType.MOVE, move)));
        }
    };
}
