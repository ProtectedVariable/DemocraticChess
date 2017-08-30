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
			if(i === 1 || i === 6) {
				game.board[i][j] = {
					piece : PieceType.PAWN,
					color : i=== 1 ? PieceColor.WHITE : PieceColor.BLACK,
					hasMoved : false
				};
			}
			else if(i === 0 || i === 7) {
				switch(j) {
					case 0:
					case 7:
						game.board[i][j] = {
							piece : PieceType.TOWER,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK,
							hasMoved : false
						};
						break;
					case 1:
					case 6:
						game.board[i][j] = {
							piece : PieceType.KNIGHT,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK,
							hasMoved : false
						};
						break;
					case 2:
					case 5:
						game.board[i][j] = {
							piece : PieceType.BISHOP,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK,
							hasMoved : false
						};
						break;
					case 3:
						game.board[i][j] = {
							piece : PieceType.KING,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK,
							hasMoved : false
						};
						break;
					case 4:
						game.board[i][j] = {
							piece : PieceType.QUEEN,
							color : i === 0 ? PieceColor.WHITE : PieceColor.BLACK,
							hasMoved : false
						};
						break;
				}
			}
			else {
				game.board[i][j] = {
					piece : PieceType.EMPTY,
					color : undefined,
					hasMoved : undefined
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

// function getPossibleMoves(engine, x, y) {
// 	test = engine.board[x][y];
// 	destinations = getAllDestinations(engine, x, y);
// 	switch(test.piece) {
// 		case PieceType.EMPTY:
// 			return undefined;
// 		case PieceType.PAWN:
// 			if(!hasMoved && isCaseEmpty(engine, )) {
//
// 			}
// 	}
// }

function getAllDestinations(engine, x, y) {
	let test = engine.board[x][y];
	let board = engine.board;
	let result = [];
	if(test.piece === PieceType.EMPTY)
		return undefined;
	switch(test.piece) {
		case PieceType.PAWN:
			if(test.color === PieceColor.WHITE) {
				if(board[x + 1][y].piece === PieceType.EMPTY) {
					if(!test.hasMoved && board[x + 2][y].piece === PieceType.EMPTY)
						result.push([x + 2, y]);
					result.push([x + 1, y]);
				}
				if(y + 1 < 8 && board[x + 1][y + 1].color === (PieceType.EMPTY + 1) % 2)
					result.push([x + 1, y + 1]);
				if(y - 1 >= 0 && board[x + 1][y - 1].color === (PieceType.EMPTY + 1) % 2)
					result.push([x + 1, y - 1]);
			}
			else {
				if(board[x - 1][y].piece === PieceType.EMPTY) {
					if(!test.hasMoved && board[x - 2][y].piece === PieceType.EMPTY)
						result.push([x - 2, y]);
					result.push([x - 1, y]);
				}
				if(y + 1 < 8 && board[x - 1][y + 1].color === (PieceType.EMPTY + 1) % 2)
					result.push([x - 1, y + 1]);
				if(y - 1 >= 0 && board[x - 1][y - 1].color === (PieceType.EMPTY + 1) % 2)
					result.push([x - 1, y - 1]);
			}
			break;
		case PieceType.TOWER:
		case PieceType.QUEEN:
			let s = x + 1;
			while(s < 8) {
				if(board[s, y].color === test.color)
					break;
				result.push([s, y]);
				if(board[s][y].piece !== PieceType.EMPTY)
					break;
				s++;
			}
			s = x - 1;
			while(s >= 0) {
				if(board[s, y].color === test.color)
					break;
				result.push([s, y]);
				if(board[s][y].piece !== PieceType.EMPTY)
					break;
				s--;
			}
			s = y + 1;
			while(s < 8) {
				if(board[x, s].color === test.color)
					break;
				result.push([x, s]);
				if(board[s][y].piece !== PieceType.EMPTY)
					break;
				s++;
			}
			s = y - 1;
			while(s >= 0) {
				if(board[x, s].color === test.color)
					break;
				result.push([x, s]);
				if(board[s][y].piece !== PieceType.EMPTY)
					break;
				s--;
			}
			if(test.piece !== PieceType.QUEEN)
				break;
		case PieceType.BISHOP:
			let m = x + 1;
			let n = y - 1;
			while(m < 8 && n >= 0) {
				if(board[m][n].color === test.color)
					break;
				result.push([m, n]);
				if(board[m][n].piece !== PieceType.EMPTY)
					break;
				m++;
				n--;
			}
			m = x - 1;
			n = y + 1;
			while(m >= 0 && n < 8) {
				if(board[m][n].color === test.color)
					break;
				result.push([m, n]);
				if(board[m][n].piece !== PieceType.EMPTY)
					break;
				m--;
				n++;
			}
			m = x + 1;
			n = y + 1;
			while(m < 8 && n < 8) {
				if(board[m][n].color === test.color)
					break;
				result.push([m, n]);
				if(board[m][n].piece !== PieceType.EMPTY)
					break;
				m++;
				n++;
			}
			m = x - 1;
			n = y - 1;
			while(m >= 0 && n >= 0) {
				if(board[m][n].color === test.color)
					break;
				result.push([m, n]);
				if(board[m][n].piece !== PieceType.EMPTY)
					break;
				m--;
				n--;
			}
			break;
		case PieceType.KNIGHT:
			if(x - 2 >= 0)
			{
				if(y + 1 < 8 && board[x - 2, y + 1].color !== test.color)
					result.push([x - 2, y + 1]);
				if(y - 1 >= 0 && board[x - 2, y - 1].color !== test.color)
					result.push([x - 2, y - 1]);
			}
			if(x + 2 < 8)
			{
				if(y + 1 < 8 && board[x + 2, y + 1].color !== test.color)
					result.push([x + 2, y + 1]);
				if(y - 1 >= 0 && board[x + 2, y - 1].color !== test.color)
					result.push([x + 2, y - 1]);
			}
			if(y - 2 >= 0)
			{
				if(x + 1 < 8 && board[x + 1, y - 2].color !== test.color)
					result.push([x + 1, y - 2]);
				if(x - 1 >= 0 && board[x - 1, y - 2].color !== test.color)
					result.push([x - 1, y - 2]);
			}
			if(y + 2 < 8)
			{
				if(x + 1 < 8 && board[x + 1, y + 2].color !== test.color)
					result.push([x + 1, y + 2]);
				if(x - 1 >= 0 && board[x - 1, y + 2].color !== test.color)
					result.push([x - 1, y + 2]);
			}
			break;
		case PieceType.KING:
			for(let i = -1 ; i <= 1 ; i++) {
				for(let j = -1 ; j <= 1 ; j++) {
					if((x + i >= 0 && x + i < 8) && (y + j >= 0 && y + j < 8) && (i !== 0 || j !== 0)) {
						if(board[x + i, y + j].color !== test.color)
							result.push([x + i, y + j]);
					}
				}
			}
			if(isSmallCastlingPossible(engine, test.color)) {
				if(test.color === PieceColor.WHITE)
					result.push([0, 1]);
				else
					result.push([7, 1]);
			}
			else if(isGreatCastlingPossible(engine, test.color)) {
				if(test.color === PieceColor.WHITE)
					result.push([0, 5]);
				else
					result.push([7, 5]);
			}
			break;
	}
	return result;
}

function isCaseEmpty(engine, x, y) {
	return engine.board[x][y] === PieceType.EMPTY;
}

function doesCaseContainEnemy(engine, x, y, player) {
	return !isCaseEmpty(engine, x, y) && engine.board[x][y].color !== player;
}

function isSmallCastlingPossible(engine, player) {
	if(player === PieceColor.WHITE &&
		engine.board[0][1].piece === PieceType.EMPTY &&
		engine.board[0][2].piece === PieceType.EMPTY &&
		engine.board[0][0].piece === PieceType.TOWER &&
		engine.board[0][3].piece === PieceType.KING &&
		!engine.board[0][0].hasMoved &&
		!engine.board[0][3].hasMoved)
		return true;
	if(player === PieceColor.BLACK &&
		engine.board[7][1].piece === PieceType.EMPTY &&
		engine.board[7][2].piece === PieceType.EMPTY &&
		engine.board[7][0].piece === PieceType.TOWER &&
		engine.board[7][3].piece === PieceType.KING &&
		!engine.board[7][0].hasMoved &&
		!engine.board[7][3].hasMoved)
		return true;
	return false;
}

function isGreatCastlingPossible(engine, player) {
	if(player === PieceColor.WHITE &&
		engine.board[0][4].piece === PieceType.EMPTY &&
		engine.board[0][5].piece === PieceType.EMPTY &&
		engine.board[0][6].piece === PieceType.EMPTY &&
		engine.board[0][7].piece === PieceType.TOWER &&
		engine.board[0][3].piece === PieceType.KING &&
		!engine.board[0][7].hasMoved &&
		!engine.board[0][3].hasMoved)
		return true;
	if(player === PieceColor.BLACK &&
		engine.board[7][4].piece === PieceType.EMPTY &&
		engine.board[7][5].piece === PieceType.EMPTY &&
		engine.board[7][6].piece === PieceType.EMPTY &&
		engine.board[7][7].piece === PieceType.TOWER &&
		engine.board[7][3].piece === PieceType.KING &&
		!engine.board[7][7].hasMoved &&
		!engine.board[7][3].hasMoved)
		return true;
	return false;
}

let engine = getNewGame();
printBoard(engine);
for(let i = 0 ; i < 8 ; i++) {
	console.log();
	console.log(engine.board[0][i].piece);
	let result = getAllDestinations(engine, 0, i);
	console.log(result);
}