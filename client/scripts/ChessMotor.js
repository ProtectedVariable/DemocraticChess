"use strict";
const chess = require("../common/chess.js");

const EMPTY_CASE = {
    piece: chess.PieceType.EMPTY,
    color: undefined,
    hasMoved: undefined
}

function getNewGame() {
    let game = {
        board: [[0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]]
    }

    game.board.forEach(function (el, i) {
        el.forEach(function (element, j) {
            if (i === 1 || i === 6) {
                game.board[i][j] = {
                    piece: chess.PieceType.PAWN,
                    color: i % 2,
                    hasMoved: false
                };
            }
            else if (i === 0 || i === 7) {
                switch (j) {
                    case 0:
                    case 7:
                        game.board[i][j] = {
                            piece: chess.PieceType.TOWER,
                            color: (i + 1) % 2,
                            hasMoved: false
                        };
                        break;
                    case 1:
                    case 6:
                        game.board[i][j] = {
                            piece: chess.PieceType.KNIGHT,
                            color: (i + 1) % 2,
                            hasMoved: false
                        };
                        break;
                    case 2:
                    case 5:
                        game.board[i][j] = {
                            piece: chess.PieceType.BISHOP,
                            color: (i + 1) % 2,
                            hasMoved: false
                        };
                        break;
                    case 3:
                        game.board[i][j] = {
                            piece: chess.PieceType.KING,
                            color: (i + 1) % 2,
                            hasMoved: false
                        };
                        break;
                    case 4:
                        game.board[i][j] = {
                            piece: chess.PieceType.QUEEN,
                            color: (i + 1) % 2,
                            hasMoved: false
                        };
                        break;
                }
            }
            else
                game.board[i][j] = EMPTY_CASE;
        });
    });

    return game;
}

function printBoard(engine) {
    engine.board.forEach(line => {
        let lineString = "";
        line.forEach(element => {
            switch (element.piece) {
                case chess.PieceType.EMPTY:
                    lineString += "  ";
                    break;
                case chess.PieceType.PAWN:
                    lineString += "P ";
                    break;
                case chess.PieceType.TOWER:
                    lineString += "T ";
                    break;
                case chess.PieceType.KNIGHT:
                    lineString += "C ";
                    break;
                case chess.PieceType.BISHOP:
                    lineString += "F ";
                    break;
                case chess.PieceType.KING:
                    lineString += "R ";
                    break;
                case chess.PieceType.QUEEN:
                    lineString += "D ";
                    break;
            }
        });
        console.log(lineString);
    });
}

function getBoardCopy(engine) {
    let clone = getNewGame();
    engine.board.forEach(function (line, i) {
        line.forEach(function (spot, j) {
            clone.board[i][j] = spot;
        });
    });
    return clone;
}

function move(engine, fromX, fromY, toX, toY) {
    let eaten = engine.board[toX][toY].piece;

    engine.board[fromX][fromY].hasMoved = true;
    engine.board[toX][toY] = engine.board[fromX][fromY];
    engine.board[fromX][fromY] = EMPTY_CASE;

    if (eaten === chess.PieceType.EMPTY)
        return undefined;
    else
        return eaten;
}

function getAllPossibleMoves(engine, x, y) {
    let test = engine.board[x][y];
    let board = engine.board;
    let result = [];
    if (test.piece === chess.PieceType.EMPTY)
        return undefined;
    switch (test.piece) {
        case chess.PieceType.PAWN:
            if (test.color === chess.PieceColor.WHITE) {
                if (board[x + 1][y].piece === chess.PieceType.EMPTY) {
                    if (!test.hasMoved && board[x + 2][y].piece === chess.PieceType.EMPTY)
                        result.push([x + 2, y]);
                    result.push([x + 1, y]);
                }
                if (y + 1 < 8 && board[x + 1][y + 1].color === (chess.PieceType.EMPTY + 1) % 2)
                    result.push([x + 1, y + 1]);
                if (y - 1 >= 0 && board[x + 1][y - 1].color === (chess.PieceType.EMPTY + 1) % 2)
                    result.push([x + 1, y - 1]);
            }
            else {
                if (board[x - 1][y].piece === chess.PieceType.EMPTY) {
                    if (!test.hasMoved && board[x - 2][y].piece === chess.PieceType.EMPTY)
                        result.push([x - 2, y]);
                    result.push([x - 1, y]);
                }
                if (y + 1 < 8 && board[x - 1][y + 1].color === (chess.PieceType.EMPTY + 1) % 2)
                    result.push([x - 1, y + 1]);
                if (y - 1 >= 0 && board[x - 1][y - 1].color === (chess.PieceType.EMPTY + 1) % 2)
                    result.push([x - 1, y - 1]);
            }
            break;
        case chess.PieceType.TOWER:
        case chess.PieceType.QUEEN:
            let s = x + 1;
            while (s < 8) {
                if (board[s][y].color === test.color)
                    break;
                result.push([s, y]);
                if (board[s][y].piece !== chess.PieceType.EMPTY)
                    break;
                s++;
            }
            s = x - 1;
            while (s >= 0) {
                if (board[s][y].color === test.color)
                    break;
                result.push([s, y]);
                if (board[s][y].piece !== chess.PieceType.EMPTY)
                    break;
                s--;
            }
            s = y + 1;
            while (s < 8) {
                if (board[x][s].color === test.color)
                    break;
                result.push([x, s]);
                if (board[s][y].piece !== chess.PieceType.EMPTY)
                    break;
                s++;
            }
            s = y - 1;
            while (s >= 0) {
                if (board[x][s].color === test.color)
                    break;
                result.push([x, s]);
                if (board[s][y].piece !== chess.PieceType.EMPTY)
                    break;
                s--;
            }
            if (test.piece !== chess.PieceType.QUEEN)
                break;
        case chess.PieceType.BISHOP:
            let m = x + 1;
            let n = y - 1;
            while (m < 8 && n >= 0) {
                if (board[m][n].color === test.color)
                    break;
                result.push([m, n]);
                if (board[m][n].piece !== chess.PieceType.EMPTY)
                    break;
                m++;
                n--;
            }
            m = x - 1;
            n = y + 1;
            while (m >= 0 && n < 8) {
                if (board[m][n].color === test.color)
                    break;
                result.push([m, n]);
                if (board[m][n].piece !== chess.PieceType.EMPTY)
                    break;
                m--;
                n++;
            }
            m = x + 1;
            n = y + 1;
            while (m < 8 && n < 8) {
                if (board[m][n].color === test.color)
                    break;
                result.push([m, n]);
                if (board[m][n].piece !== chess.PieceType.EMPTY)
                    break;
                m++;
                n++;
            }
            m = x - 1;
            n = y - 1;
            while (m >= 0 && n >= 0) {
                if (board[m][n].color === test.color)
                    break;
                result.push([m, n]);
                if (board[m][n].piece !== chess.PieceType.EMPTY)
                    break;
                m--;
                n--;
            }
            break;
        case chess.PieceType.KNIGHT:
            if (x - 2 >= 0) {
                if (y + 1 < 8 && board[x - 2][y + 1].color !== test.color)
                    result.push([x - 2, y + 1]);
                if (y - 1 >= 0 && board[x - 2][y - 1].color !== test.color)
                    result.push([x - 2, y - 1]);
            }
            if (x + 2 < 8) {
                if (y + 1 < 8 && board[x + 2][y + 1].color !== test.color)
                    result.push([x + 2, y + 1]);
                if (y - 1 >= 0 && board[x + 2][y - 1].color !== test.color)
                    result.push([x + 2, y - 1]);
            }
            if (y - 2 >= 0) {
                if (x + 1 < 8 && board[x + 1][y - 2].color !== test.color)
                    result.push([x + 1, y - 2]);
                if (x - 1 >= 0 && board[x - 1][y - 2].color !== test.color)
                    result.push([x - 1, y - 2]);
            }
            if (y + 2 < 8) {
                if (x + 1 < 8 && board[x + 1][y + 2].color !== test.color)
                    result.push([x + 1, y + 2]);
                if (x - 1 >= 0 && board[x - 1][y + 2].color !== test.color)
                    result.push([x - 1, y + 2]);
            }
            break;
        case chess.PieceType.KING:
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if ((x + i >= 0 && x + i < 8) && (y + j >= 0 && y + j < 8) && (i !== 0 || j !== 0)) {
                        if (board[x + i][y + j].color !== test.color)
                            result.push([x + i, y + j]);
                    }
                }
            }
            if (isSmallCastlingPossible(engine, test.color)) {
                if (test.color === chess.PieceColor.WHITE)
                    result.push([0, 1]);
                else
                    result.push([7, 1]);
            }
            else if (isGreatCastlingPossible(engine, test.color)) {
                if (test.color === chess.PieceColor.WHITE)
                    result.push([0, 5]);
                else
                    result.push([7, 5]);
            }
            break;
    }
    if (result.length > 0)
        return result;
    else
        return undefined;
}

function isSmallCastlingPossible(engine, player) {
    if (player === chess.PieceColor.WHITE &&
        engine.board[0][1].piece === chess.PieceType.EMPTY &&
        engine.board[0][2].piece === chess.PieceType.EMPTY &&
        engine.board[0][0].piece === chess.PieceType.TOWER &&
        engine.board[0][3].piece === chess.PieceType.KING &&
        !engine.board[0][0].hasMoved &&
        !engine.board[0][3].hasMoved)
        return true;
    if (player === chess.PieceColor.BLACK &&
        engine.board[7][1].piece === chess.PieceType.EMPTY &&
        engine.board[7][2].piece === chess.PieceType.EMPTY &&
        engine.board[7][0].piece === chess.PieceType.TOWER &&
        engine.board[7][3].piece === chess.PieceType.KING &&
        !engine.board[7][0].hasMoved &&
        !engine.board[7][3].hasMoved)
        return true;
    return false;
}

function isGreatCastlingPossible(engine, player) {
    if (player === chess.PieceColor.WHITE &&
        engine.board[0][4].piece === chess.PieceType.EMPTY &&
        engine.board[0][5].piece === chess.PieceType.EMPTY &&
        engine.board[0][6].piece === chess.PieceType.EMPTY &&
        engine.board[0][7].piece === chess.PieceType.TOWER &&
        engine.board[0][3].piece === chess.PieceType.KING &&
        !engine.board[0][7].hasMoved &&
        !engine.board[0][3].hasMoved)
        return true;
    if (player === chess.PieceColor.BLACK &&
        engine.board[7][4].piece === chess.PieceType.EMPTY &&
        engine.board[7][5].piece === chess.PieceType.EMPTY &&
        engine.board[7][6].piece === chess.PieceType.EMPTY &&
        engine.board[7][7].piece === chess.PieceType.TOWER &&
        engine.board[7][3].piece === chess.PieceType.KING &&
        !engine.board[7][7].hasMoved &&
        !engine.board[7][3].hasMoved)
        return true;
    return false;
}

//Teste si le roi de la couleur color est en echec
function checkCheck(engine, color) {
    let targetX = 0;
    let targetY = 0;
    let allCasesEnnemyCanReach = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (engine.board[i][j].color !== color && engine.board[i][j].piece !== chess.PieceType.EMPTY) {
                let moves = getAllPossibleMoves(engine, i, j);
                if (moves !== undefined)
                    moves.forEach(move => allCasesEnnemyCanReach.push(move));
            }
            if (engine.board[i][j].color === color && engine.board[i][j].piece === chess.PieceType.KING) {
                targetX = i;
                targetY = j;
            }
        }
    }
    let result = false;
    allCasesEnnemyCanReach.forEach(move => {
        if (move[0] === targetX && move[1] === targetY)
            result = true;
    })
    return result;
}

//Teste si le roi de la couleur color est echec et mat
function checkCheckMate(engine, color) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let result = true;
            if (engine.board[i][j].color === color) {
                let engineCopy = getBoardCopy(engine);
                let moves = getAllPossibleMoves(engineCopy, i, j);
                moves.forEach(possibleMove => {
                    move(engineCopy, i, j, possibleMove[0], possibleMove[1]);
                    result = checkCheck(engineCopy, color);
                    if (result === false)
                        return;

                });
                if (!result)
                    return false;
            }
        }
    }
    return true;
}

let engine = getNewGame();
engine.board[6][3].piece = chess.PieceType.QUEEN;
engine.board[6][3].color = chess.PieceColor.WHITE;
printBoard(engine);
console.log(checkCheckMate(engine, 0));
printBoard(engine);
