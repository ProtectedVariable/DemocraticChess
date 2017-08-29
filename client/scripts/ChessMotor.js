"use strict";

const PieceType = {
	EMPTY : 0,
	PAWN : 1,
	TOWER : 2,
	KNIGHT : 3,
	BISHOP : 4,
	QUEEN : 5,
	KING : 6
};

const PieceColor = {
	BLACK : 0,
	WHITE : 1
};

function getNewGame() {
	let game = {
		board : [[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0]]
	}

	game.board.forEach(function(el, i) {
		el.forEach(function(element, j) {
			if(i === 1) {
				game.board[i][j] = {
					piece : PieceType.PAWN,
					color : PieceColor.WHITE
				};
			}
			else if(i === 6) {
				game.board[i][j] = {
					piece : PieceType.PAWN,
					color : PieceColor.BLACK
				};
			}
			else if(i === 0 || i === 7) {
				switch(j) {
					case 0:
					case 7:
						game.board[i][j] = {
							piece : PieceType.TOWER,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
					case 1:
					case 6:
						game.board[i][j] = {
							piece : PieceType.KNIGHT,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
					case 2:
					case 5:
						game.board[i][j] = {
							piece : PieceType.BISHOP,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
					case 3:
						game.board[i][j] = {
							piece : PieceType.KING,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
					case 4:
						game.board[i][j] = {
							piece : PieceType.QUEEN,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
				}
			}
			else {
				game.board[i][j] = {
					piece : PieceType.EMPTY,
					color : undefined
				}
			}
		});
	});

	return game;
}

function printBoard(engine) {
	engine.board.forEach(line => {
		let lineString = "";
		line.forEach(element => {
			switch(element.piece) {
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
}

let engine = getNewGame();
printBoard(engine);
