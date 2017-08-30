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
    ID:13,
};

function newMessage(type, params) {
    return {type, params};
}

function communication(id, message) {
    return {id, message};
}

exports.messageType = messageType;
exports.newMessage = newMessage;
exports.communication = communication;