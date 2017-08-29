"use strict";

const color1 = "#f0d9b5";
const color2 = "#b58863";

function init() {
    let canvas = document.getElementById("chessboard");
    let ctx = canvas.getContext("2d");
    renderBoard(ctx);
    return ctx;
}

function renderBoard(ctx) {
    let x = 0;
    let y = 0;
    while(x < 8 && y < 8) {
        if((x + y) % 2 == 0) {
            ctx.fillStyle = color1;
        } else {
            ctx.fillStyle = color2;
        }
        ctx.fillRect(x*89, y*89, 89, 89);
        x++;
        if(x >= 8) {
            y++;
            x = 0;
        }
    }
}
