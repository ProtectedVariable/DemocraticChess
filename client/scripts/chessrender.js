"use strict";

const color1 = "#f0d9b5";
const color2 = "#b58863";
const textColor = "#777777";
const tileSize = 83;

let ctx;
let canvas;

function refreshGame(board) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderBoard();
    console.log(board);
    board.forEach(function(line, y) {
        line.forEach(function(item, x) {
            if(item.piece !== PieceType.EMPTY) {
                ctx.drawImage(images[item.color*10+item.piece], x*tileSize, y*tileSize, tileSize, tileSize);
            }
        });
    });
}

function renderBoard() {
    let x = 0;
    let y = 0;
    while(x < 8 && y < 8) {
        if((x + y) % 2 === 0) {
            ctx.fillStyle = color1;
        } else {
            ctx.fillStyle = color2;
        }
        ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
        x += 1;
        if(x >= 8) {
            y += 1;
            ctx.fillStyle = textColor;
            ctx.fillText(""+y,x*tileSize+2, y*tileSize-tileSize/2+10);
            x = 0;
        }
    }
    x = 0;
    while(x < 8) {
        ctx.fillStyle = textColor;
        ctx.fillText(String.fromCharCode(65+x), x*tileSize+tileSize/2-10, 8*tileSize+17);
        x += 1;
    }
}

function init() {
    canvas = document.getElementById("chessboard");
    ctx = canvas.getContext("2d");
    ctx.font = "20px Arial";
    renderBoard(ctx);
    let name = "";
    while(name === "") {
        name = prompt("Please enter your nickname");
    }
    if(name == null) {
        window.location.replace("http://google.com");
        return;
    }
    connect(name);
    return ctx;
}
