"use strict";

const color1 = "#f0d9b5";
const color2 = "#b58863";
const textColor = "#777777";
const tileSize = 83;

let ctx;


function renderPieces(ctx, board) {

}

function renderBoard(ctx) {
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
    let canvas = document.getElementById("chessboard");
    ctx = canvas.getContext("2d");
    ctx.font = "20px Arial";
    renderBoard(ctx);
    let name = "";
    while(name == null || name === "") {
        name = prompt("Please enter your nickname");
    }
    connect(name);
    return ctx;
}
