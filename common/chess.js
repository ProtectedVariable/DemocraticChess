const PieceType = {
    EMPTY: 0,
    PAWN: 1,
    TOWER: 2,
    KNIGHT: 3,
    BISHOP: 4,
    QUEEN: 5,
    KING: 6
};

const PieceColor = {
    BLACK: 0,
    WHITE: 1
};

function cell(x, y) {
    return {x, y};
}

function move(startCell, endCell) {
    return {startCell, endCell};
}


exports.PieceType = PieceType;
exports.PieceColor = PieceColor;
exports.cell = cell;
exports.move = move;