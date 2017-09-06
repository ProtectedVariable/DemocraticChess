"use strict";

const BASE_TIME = 40;

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

function getEmptyCase() {
    return {
        piece: PieceType.EMPTY,
        color: undefined,
        hasMoved: undefined,
		hasJustDoubleMoved: false
    };
}

function newCell(x, y) {
    return {
        x,
        y
    };
}

function newMove(startCell, endCell) {
    return {
        startCell,
        endCell
    };
}

function getNewGame() {
    let engine = {
        board: [[0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]],

        setBoard: function (givenBoard) {
            this.board = givenBoard;
        },

        printBoard: function () {
            this.board.forEach(line => {
                let lineString = "";
                line.forEach(element => {
                    switch (element.piece) {
                        case PieceType.EMPTY:
                            lineString += "  ";
                            break;
                        case PieceType.PAWN:
                            lineString += "P ";
                            break;
                        case PieceType.TOWER:
                            lineString += "T ";
                            break;
                        case PieceType.KNIGHT:
                            lineString += "C ";
                            break;
                        case PieceType.BISHOP:
                            lineString += "F ";
                            break;
                        case PieceType.KING:
                            lineString += "R ";
                            break;
                        case PieceType.QUEEN:
                            lineString += "D ";
                            break;
                    }
                });
                console.log(lineString);
            });
        },

        getBoardCopy: function () {
            let clone = getNewGame();
            this.board.forEach(function (line, i) {
                line.forEach(function (spot, j) {
					let p = spot.piece;
					let c = spot.color;
					let hm = spot.hasMoved;
					let hjdm = spot.hasJustDoubleMoved;
                    clone.board[i][j] = {
						piece : p,
						color : c,
						hasMoved : hm,
						hasJustDoubleMoved : hjdm
					};
                });
            });
            return clone;
        },

        getCellCopy: function (cell) {
            return {
                piece: this.board[cell.x][cell.y].piece,
                color: this.board[cell.x][cell.y].color,
                hasMoved: this.board[cell.x][cell.y].hasMoved,
                hasJustDoubleMoved: this.board[cell.x][cell.y].hasJustDoubleMoved
            };
        },

        move: function (mv) {
			if(this.board[mv.startCell.x][mv.startCell.y].piece === PieceType.PAWN && mv.endCell.y !== mv.startCell.y) {
				if(this.board[mv.startCell.x][mv.endCell.y].hasJustDoubleMoved)
					this.board[mv.startCell.x][mv.endCell.y] = getEmptyCase();
			}

			this.board.forEach(line => {
				line.forEach(spot => {
					spot.hasJustDoubleMoved = false;
				});
			});

			if(this.board[mv.startCell.x][mv.startCell.y].piece === PieceType.PAWN && Math.abs(mv.startCell.x - mv.endCell.x) > 1)
				this.board[mv.startCell.x][mv.startCell.y].hasJustDoubleMoved = true;

			if(this.board[mv.startCell.x][mv.startCell.y].piece === PieceType.KING && Math.abs(mv.startCell.y - mv.endCell.y) > 1) {
				if(this.isGreatCastlingPossible(this.board[mv.startCell.x][mv.startCell.y].color) && mv.endCell.y === 5) {
					this.board[mv.startCell.x][7].hasMoved = true;
					this.board[mv.startCell.x][4] = this.getCellCopy(newCell(mv.startCell.x, 7));
					this.board[mv.startCell.x][7] = getEmptyCase();
				}
				else if(this.isSmallCastlingPossible(this.board[mv.startCell.x][mv.startCell.y].color) && mv.endCell.y === 1) {
					this.board[mv.startCell.x][0].hasMoved = true;
					this.board[mv.startCell.x][2] = this.getCellCopy(newCell(mv.startCell.x, 0));
					this.board[mv.startCell.x][0] = getEmptyCase();
				}
			}

            let eaten = this.board[mv.endCell.x][mv.endCell.y].piece;

            this.board[mv.startCell.x][mv.startCell.y].hasMoved = true;
            this.board[mv.endCell.x][mv.endCell.y] = this.getCellCopy(mv.startCell);
            this.board[mv.startCell.x][mv.startCell.y] = getEmptyCase();

            if (eaten === PieceType.EMPTY)
                return undefined;
            else
                return eaten;
        },

        getAllPossibleMoves: function(cell, noCheckCheck) {
            let test = this.board[cell.x][cell.y];
            let result = [];
            if (test.piece === PieceType.EMPTY)
                return undefined;
			if(noCheckCheck === undefined)
				noCheckCheck = false;
            switch (test.piece) {
                case PieceType.PAWN:
                    if (test.color === PieceColor.WHITE && cell.x + 1 < 8) {
                        if (this.board[cell.x + 1][cell.y].piece === PieceType.EMPTY) {
                            if (!test.hasMoved && this.board[cell.x + 2][cell.y].piece === PieceType.EMPTY)
                                result.push(newCell(cell.x + 2, cell.y));
                            result.push(newCell(cell.x + 1, cell.y));
                        }
                        if ((cell.y + 1 < 8 && this.board[cell.x + 1][cell.y + 1].color === PieceColor.BLACK)
						|| (cell.x === 4 && cell.y + 1 < 8 && this.board[cell.x][cell.y + 1].hasJustDoubleMoved))
                            result.push(newCell(cell.x + 1, cell.y + 1));
                        if ((cell.y - 1 >= 0 && this.board[cell.x + 1][cell.y - 1].color === PieceColor.BLACK)
						|| (cell.x === 4 && cell.y - 1 >= 0 && this.board[cell.x][cell.y - 1].hasJustDoubleMoved))
                            result.push(newCell(cell.x + 1, cell.y - 1));
                    }
                    else if (cell.x - 1 >= 0) {
                        if (this.board[cell.x - 1][cell.y].piece === PieceType.EMPTY) {
                            if (!test.hasMoved && this.board[cell.x - 2][cell.y].piece === PieceType.EMPTY)
                                result.push(newCell(cell.x - 2, cell.y));
                            result.push(newCell(cell.x - 1, cell.y));
                        }
                        if ((cell.y + 1 < 8 && this.board[cell.x - 1][cell.y + 1].color === PieceColor.WHITE)
						|| (cell.x === 3 && cell.y + 1 < 8 && this.board[cell.x][cell.y + 1].hasJustDoubleMoved))
                            result.push(newCell(cell.x - 1, cell.y + 1));
                        if ((cell.y - 1 >= 0 && this.board[cell.x - 1][cell.y - 1].color === PieceColor.WHITE)
						|| (cell.x === 3 && cell.y - 1 >= 0 &&this.board[cell.x][cell.y - 1].hasJustDoubleMoved))
                            result.push(newCell(cell.x - 1, cell.y - 1));
                    }
                    break;
                case PieceType.TOWER:
                case PieceType.QUEEN:
                    let s = cell.x + 1;
                    while(s < 8) {
                        if (this.board[s][cell.y].color === test.color)
                            break;
                        result.push(newCell(s, cell.y));
                        if (this.board[s][cell.y].piece !== PieceType.EMPTY)
                            break;
                        s++;
                    }
                    s = cell.x - 1;
                    while (s >= 0) {
                        if (this.board[s][cell.y].color === test.color)
                            break;
                        result.push(newCell(s, cell.y));
                        if (this.board[s][cell.y].piece !== PieceType.EMPTY)
                            break;
                        s--;
                    }
                    s = cell.y + 1;
                    while(s < 8) {
                        if(this.board[cell.x][s].color === test.color)
                            break;
                        result.push(newCell(cell.x, s));
                        if(this.board[cell.x][s].piece !== PieceType.EMPTY)
                            break;
                        s++;
                    }
                    s = cell.y - 1;
                    while(s >= 0) {
                        if(this.board[cell.x][s].color === test.color)
                            break;
                        result.push(newCell(cell.x, s));
                        if(this.board[cell.x][s].piece !== PieceType.EMPTY)
                            break;
                        s--;
                    }
                    if (test.piece !== PieceType.QUEEN)
                        break;
                case PieceType.BISHOP:
                    let m = cell.x + 1;
                    let n = cell.y - 1;
                    while (m < 8 && n >= 0) {
                        if (this.board[m][n].color === test.color)
                            break;
                        result.push(newCell(m, n));
                        if (this.board[m][n].piece !== PieceType.EMPTY)
                            break;
                        m++;
                        n--;
                    }
                    m = cell.x - 1;
                    n = cell.y + 1;
                    while (m >= 0 && n < 8) {
                        if (this.board[m][n].color === test.color)
                            break;
                        result.push(newCell(m, n));
                        if (this.board[m][n].piece !== PieceType.EMPTY)
                            break;
                        m--;
                        n++;
                    }
                    m = cell.x + 1;
                    n = cell.y + 1;
                    while (m < 8 && n < 8) {
                        if (this.board[m][n].color === test.color)
                            break;
                        result.push(newCell(m, n));
                        if (this.board[m][n].piece !== PieceType.EMPTY)
                            break;
                        m++;
                        n++;
                    }
                    m = cell.x - 1;
                    n = cell.y - 1;
                    while (m >= 0 && n >= 0) {
                        if (this.board[m][n].color === test.color)
                            break;
                        result.push(newCell(m, n));
                        if (this.board[m][n].piece !== PieceType.EMPTY)
                            break;
                        m--;
                        n--;
                    }
                    break;
                case PieceType.KNIGHT:
                    if (cell.x - 2 >= 0) {
                        if (cell.y + 1 < 8 && this.board[cell.x - 2][cell.y + 1].color !== test.color)
                            result.push(newCell(cell.x - 2, cell.y + 1));
                        if (cell.y - 1 >= 0 && this.board[cell.x - 2][cell.y - 1].color !== test.color)
                            result.push(newCell(cell.x - 2, cell.y - 1));
                    }
                    if (cell.x + 2 < 8) {
                        if (cell.y + 1 < 8 && this.board[cell.x + 2][cell.y + 1].color !== test.color)
                            result.push(newCell(cell.x + 2, cell.y + 1));
                        if (cell.y - 1 >= 0 && this.board[cell.x + 2][cell.y - 1].color !== test.color)
                            result.push(newCell(cell.x + 2, cell.y - 1));
                    }
                    if (cell.y - 2 >= 0) {
                        if (cell.x + 1 < 8 && this.board[cell.x + 1][cell.y - 2].color !== test.color)
                            result.push(newCell(cell.x + 1, cell.y - 2));
                        if (cell.x - 1 >= 0 && this.board[cell.x - 1][cell.y - 2].color !== test.color)
                            result.push(newCell(cell.x - 1, cell.y - 2));
                    }
                    if (cell.y + 2 < 8) {
                        if (cell.x + 1 < 8 && this.board[cell.x + 1][cell.y + 2].color !== test.color)
                            result.push(newCell(cell.x + 1, cell.y + 2));
                        if (cell.x - 1 >= 0 && this.board[cell.x - 1][cell.y + 2].color !== test.color)
                            result.push(newCell(cell.x - 1, cell.y + 2));
                    }
                    break;
                case PieceType.KING:
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if ((cell.x + i >= 0 && cell.x + i < 8) && (cell.y + j >= 0 && cell.y + j < 8) && (i !== 0 || j !== 0)) {
                                if (this.board[cell.x + i][cell.y + j].color !== test.color)
                                    result.push(newCell(cell.x + i, cell.y + j));
                            }
                        }
                    }
                    if (this.isSmallCastlingPossible(test.color)) {
                        if (test.color === PieceColor.WHITE)
                            result.push(newCell(0, 1));
                        else
                            result.push(newCell(7, 1));
                    }
                    if (this.isGreatCastlingPossible(test.color)) {
                        if (test.color === PieceColor.WHITE)
                            result.push(newCell(0, 5));
                        else
                            result.push(newCell(7, 5));
                    }

                    break;
            }

			if(!noCheckCheck)
				result = result.filter(this.testIfKingIsSuicidal(this, cell));
			if(result.length > 0)
				return result;
            else
                return undefined;
        },

        testIfKingIsSuicidal: function (engine, cell) {
            return function (proposed) {
                let copy = engine.getBoardCopy();
				let team = copy.board[cell.x][cell.y].color;
                copy.move(newMove(cell, proposed));
                let result = !copy.checkCheck(team, true);
                return result;
            }
        },

        isSmallCastlingPossible: function (player) {
            if (player === PieceColor.WHITE &&
                this.board[0][1].piece === PieceType.EMPTY &&
                this.board[0][2].piece === PieceType.EMPTY &&
                this.board[0][0].piece === PieceType.TOWER &&
                this.board[0][3].piece === PieceType.KING &&
                !this.board[0][0].hasMoved &&
                !this.board[0][3].hasMoved)
                return true;
            if (player === PieceColor.BLACK &&
                this.board[7][1].piece === PieceType.EMPTY &&
                this.board[7][2].piece === PieceType.EMPTY &&
                this.board[7][0].piece === PieceType.TOWER &&
                this.board[7][3].piece === PieceType.KING &&
                !this.board[7][0].hasMoved &&
                !this.board[7][3].hasMoved)
                return true;
            return false;
        },

        isGreatCastlingPossible: function (player) {
            if (player === PieceColor.WHITE &&
                this.board[0][4].piece === PieceType.EMPTY &&
                this.board[0][5].piece === PieceType.EMPTY &&
                this.board[0][6].piece === PieceType.EMPTY &&
                this.board[0][7].piece === PieceType.TOWER &&
                this.board[0][3].piece === PieceType.KING &&
                !this.board[0][7].hasMoved &&
                !this.board[0][3].hasMoved)
                return true;
            if (player === PieceColor.BLACK &&
                this.board[7][4].piece === PieceType.EMPTY &&
                this.board[7][5].piece === PieceType.EMPTY &&
                this.board[7][6].piece === PieceType.EMPTY &&
                this.board[7][7].piece === PieceType.TOWER &&
                this.board[7][3].piece === PieceType.KING &&
                !this.board[7][7].hasMoved &&
                !this.board[7][3].hasMoved)
                return true;
            return false;
        },

		promotePawn : function(cell, type) {
			if(this.board[cell.x][cell.y].piece === PieceType.PAWN && type >= PieceType.TOWER && type <= PieceType.QUEEN)
				this.board[cell.x][cell.y].piece = type;
		},

        //Teste si le roi de la couleur color est en echec
        checkCheck: function (color, noKing) {
            let kingCell = undefined;
            let allCasesEnnemyCanReach = [];
			if(noKing === undefined)
				noKing = false;
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.board[i][j].color !== color && this.board[i][j].piece !== PieceType.EMPTY) {
                        let moves = this.getAllPossibleMoves(newCell(i, j), noKing);
                        if (moves !== undefined)
                            moves.forEach(move => allCasesEnnemyCanReach.push(move));
                    }
                    if (this.board[i][j].color === color && this.board[i][j].piece === PieceType.KING)
                        kingCell = newCell(i, j);
                }
            }
            let result = false;
            allCasesEnnemyCanReach.forEach(cell => {
                if (cell.x === kingCell.x && cell.y === kingCell.y)
                    result = true;
            });
            return result;
        },

        //Teste si le roi de la couleur color est echec et mat
        checkCheckMate: function (color) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    let result = true;
                    if (this.board[i][j].color === color) {
                        let moves = this.getAllPossibleMoves(newCell(i, j));
                        if (moves === undefined)
                            continue;
                        moves.forEach(possibleMove => {
							let engineCopy = this.getBoardCopy();
                            engineCopy.move(newMove(newCell(i, j), possibleMove));
                            result = engineCopy.checkCheck(color);
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
    };

    engine.board.forEach(function (el, i) {
        el.forEach(function (element, j) {
            if (i === 1 || i === 6) {
                engine.board[i][j] = {
                    piece: PieceType.PAWN,
                    color: i % 2,
                    hasMoved: false,
					hasJustDoubleMoved: false
                };
            }
            else if (i === 0 || i === 7) {
                switch (j) {
                    case 0:
                    case 7:
                        engine.board[i][j] = {
                            piece: PieceType.TOWER,
                            color: (i + 1) % 2,
                            hasMoved: false,
							hasJustDoubleMoved: false
                        };
                        break;
                    case 1:
                    case 6:
                        engine.board[i][j] = {
                            piece: PieceType.KNIGHT,
                            color: (i + 1) % 2,
                            hasMoved: false,
							hasJustDoubleMoved: false
                        };
                        break;
                    case 2:
                    case 5:
                        engine.board[i][j] = {
                            piece: PieceType.BISHOP,
                            color: (i + 1) % 2,
                            hasMoved: false,
							hasJustDoubleMoved: false
                        };
                        break;
                    case 3:
                        engine.board[i][j] = {
                            piece: PieceType.KING,
                            color: (i + 1) % 2,
                            hasMoved: false,
							hasJustDoubleMoved: false
                        };
                        break;
                    case 4:
                        engine.board[i][j] = {
                            piece: PieceType.QUEEN,
                            color: (i + 1) % 2,
                            hasMoved: false,
							hasJustDoubleMoved: false
                        };
                        break;
                }
            }
            else
                engine.board[i][j] = getEmptyCase();
        });
    });
    return engine;
}

if (typeof exports != 'undefined') {
    exports.PieceType = PieceType;
    exports.PieceColor = PieceColor;
    exports.newCell = newCell;
    exports.newMove = newMove;
    exports.getNewGame = getNewGame;
    exports.BASE_TIME = BASE_TIME;
}
