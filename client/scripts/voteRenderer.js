"use strict";

const MAX_LINE_WIDTH = 15;
const COLOR_MOD = 11;
const COLORS = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#A0A0FF",
    "#00AAFF",
    "#AA00FF",
    "#FF00AA",
    "#FFAA00",
    "#3eefaa",
    "#398b60",
    "e668c4"
];

function voteRenderer(context) {
    return {
        votes : {},
        ctx : context,

        renderVotes : function() {
            let i = 0;
            for(let key in this.votes) {
                let value = this.votes[key];
                let vote = JSON.parse(key);
                if(value > 0) {
                    this.ctx.strokeStyle = COLORS[i % COLOR_MOD];
                    this.ctx.fillStyle = COLORS[i % COLOR_MOD];
                    this.arrow(vote.startCell.y * tileSize + tileSize / 2, vote.startCell.x * tileSize  + tileSize / 2, vote.endCell.y * tileSize  + tileSize / 2, vote.endCell.x * tileSize  + tileSize / 2, value+1);
                    this.ctx.fillStyle = "#000000";
                }
                i += 1;
            }
        },

        getVoteColor : function(move) {
            let i = 0;
            for(let key in this.votes) {
                let value = this.votes[key];
                let vote = JSON.parse(key);
                if(vote.startCell.x === move.startCell.x && vote.startCell.y === move.startCell.y) {
                    if(vote.endCell.x === move.endCell.x && vote.endCell.y === move.endCell.y) {
                        break;
                    }
                }
                i += 1;
            }
            return COLORS[i % COLOR_MOD];
        },

        arrow : function(fromx, fromy, tox, toy, width) {
            let headlen = 10;
            this.ctx.lineWidth = Math.min(width, MAX_LINE_WIDTH);
            let angle = Math.atan2(toy-fromy,tox-fromx);

            this.ctx.beginPath();
            this.ctx.moveTo(fromx, fromy);
            this.ctx.lineTo(tox, toy);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(tox, toy);
            this.ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

            this.ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

            this.ctx.lineTo(tox, toy);
            this.ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

            this.ctx.stroke();
            this.ctx.fill();
        },

        addVote : function(vote) {
            let key = JSON.stringify(vote);
            if(this.votes[key] !== undefined) {
                this.votes[key] += 1;
            } else {
                this.votes[key] = 1;
            }
        },

        removeVote : function(vote) {
            let key = JSON.stringify(vote);
            if(this.votes[key] !== undefined) {
                this.votes[key] -= 1;
                if(this.votes[key] === 0) {
                    this.votes[key] = undefined;
                }
            }
        },

        clearVotes : function() {
            this.votes = {};
        }
    };
}
