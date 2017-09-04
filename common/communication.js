const messageType = {
    NAME: 0,
    MOVE: 1,
    CHAT: 2,
    TEAM: 3,
    BOARD: 4,
    LIST: 5,
    VOTE: 6,
    INCOMING_CHAT: 7,
    MOVED: 8,
    RESULT: 9,
    CHANGE: 10,
    NEW_PLAYER: 11,
    PLAYER_LEFT: 12,
    ID: 13,
    PSEUDO_TAKEN: 14,
    PSEUDO_OK: 15,
    NEW_VOTE: 16,
    DEL_VOTE: 16,

};

function newMessage(type, params) {
    return {type, params};
}

function communication(id, message) {
    return JSON.stringify({id, message});
}

function chat(sender, message) {
    return {sender: sender === undefined ? "Server" : sender.name, message: message};
}


if (typeof exports != 'undefined') {
    exports.messageType = messageType;
    exports.newMessage = newMessage;
    exports.communication = communication;
    exports.chat = chat;
}
