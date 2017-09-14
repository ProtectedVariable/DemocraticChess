/**
 * @file client/chessRenderer.js
 * @brief Source file containing the client-side application chess-related rendering
 *
 * @authors Thomas Ibanez, Maxime Lovino, Vincent Tournier
 * @date September 6, 2017
 * @version 1.0
 */
"use strict";

const color1 = "#f0d9b5";
const color2 = "#b58863";
const textColor = "#777777";
const highlightColor =  "#007700";
const highlightColor2 =  "#AA0000";
const moveHighlightColor = "#44929f";
const highlightBorder = 6;
const tileSize = 83;

function chessRenderer(pcanvas, context) {
    context.font = "20px Arial";

    return {
        canvas : pcanvas,
        ctx : context,

        refreshGame : function(board, images, lastMove) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.renderBoard();
            if(lastMove !== undefined) {
                this.highlightMove(lastMove);
            }
            if(board !== undefined) {
                board.forEach(function(line, y) {
                    line.forEach(function(item, x) {
                        if(item.piece !== PieceType.EMPTY) {
                            this.ctx.drawImage(images[item.color*10+item.piece], x*tileSize, y*tileSize, tileSize, tileSize);
                        }
                    }, this);
                }, this);
            }
        },

        highlightTile : function(x, y, kill) {
            this.ctx.beginPath();
            if(!kill) {
                this.ctx.fillStyle = highlightColor;
                this.ctx.arc(x*tileSize+tileSize/2, y*tileSize+tileSize/2, tileSize/6, 0, 2 * Math.PI, false);
                this.ctx.fill();
            } else {
                this.ctx.strokeStyle = highlightColor2;
                this.ctx.lineWidth = highlightBorder;
                this.ctx.strokeRect(x*tileSize+highlightBorder/2, y*tileSize+highlightBorder/2, tileSize-highlightBorder, tileSize-highlightBorder);
            }
        },

        highlightMove : function(move) {
            console.log(move);
            this.ctx.fillStyle = moveHighlightColor;
            this.ctx.fillRect(move.startCell.y * tileSize, move.startCell.x * tileSize, tileSize, tileSize);
            this.ctx.fillRect(move.endCell.y * tileSize, move.endCell.x * tileSize, tileSize, tileSize);
        },

        renderBoard : function() {
            let x = 0;
            let y = 0;
            while(x < 8 && y < 8) {
                if((x + y) % 2 === 0) {
                    this.ctx.fillStyle = color1;
                } else {
                    this.ctx.fillStyle = color2;
                }
                this.ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
                x += 1;
                if(x >= 8) {
                    y += 1;
                    this.ctx.fillStyle = textColor;
                    this.ctx.fillText(""+y,x*tileSize+2, y*tileSize-tileSize/2+10);
                    x = 0;
                }
            }
            x = 0;
            while(x < 8) {
                this.ctx.fillStyle = textColor;
                this.ctx.fillText(String.fromCharCode(65+x), x*tileSize+tileSize/2-10, 8*tileSize+17);
                x += 1;
            }
        },

        checkTile : function(y, x, color) {
            this.ctx.fillStyle = highlightColor2;
            this.ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
            this.ctx.drawImage(images[color*10+PieceType.KING], x*tileSize, y*tileSize, tileSize, tileSize);
        }
    };
}
