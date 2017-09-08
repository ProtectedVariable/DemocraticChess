/**
 * @file client/socketClient.js
 * @brief Source file containing the client socket main functions
 *
 * @authors Thomas Ibanez, Maxime Lovino, Vincent Tournier
 * @date September 6, 2017
 * @version 1.0
 */
"use strict";

const SERVER_URL = "ws://localhost:8080";

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
            this.socket.onclose = function(e) {
                 location.reload();
            };
        },

        sendName : function(name) {
            if(this.id !== undefined) {
                this.socket.send(communication(this.id, newMessage(messageType.NAME, name)));
            } else {
                return false;
            }
        },

        sendMove : function(bx, by, tx, ty, p) {
            let move = newMove(newCell(bx, by), newCell(tx, ty));
            if(p !== undefined) {
                move["promotion"] = p;
            }
            this.socket.send(communication(this.id, newMessage(messageType.MOVE, move)));
        }
    };
}
