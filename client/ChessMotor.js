"use strict";

PieceType = {
	EMPTY = 0,
	PAWN = 1,
	TOWER = 2,
	KNIGHT = 3,
	BISHOP = 4,
	QUEEN = 5,
	KING = 6
};

PieceColor = {
	BLACK = 0,
	WHITE = 1
};

function getNewGame() {
	game = {
		board : [8][8]
	}
	game.board.forEach(function(el, i) {
		el.forEarch(function(element, j) {
			if(i === 1) {
				element = {
					piece : PieceType.PAWN,
					color : PieceColor.WHITE
				};
			}
			else if(i === 6) {
				element = {
					piece : PieceType.PAWN,
					color : PieceColor.BLACK
				};
			}
			else if(i === 0 || i === 7) {
				switch(j) {
					case 0:
					case 7:
						element = {
							piece : PieceType.TOWER,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
					case 1:
					case 6:
						element = {
							piece : PieceType.KNIGHT,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
					case 2:
					case 5:
						element = {
							piece : PieceType.BISHOP,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
					case 3:
						element = {
							piece : PieceType.KING,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
					case 4:
						element = {
							piece : PieceType.QUEEN,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK
						};
						break;
				}
			}
		});
	});

	return game;
}

let engine = getNewGame();
console.log(engine.board);
