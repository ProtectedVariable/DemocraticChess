"use strict";

function voteRenderer(context) {
    return {
        votes : {},
        ctx : context,

        renderVotes : function() {
            for(let key in this.votes) {
                let value = this.votes[key];
                let vote = JSON.parse(key);
                if(value > 0) {
                    this.ctx.strokeStyle = this.colorFromVote(vote);
                    this.ctx.fillStyle = this.colorFromVote(vote);
                    this.arrow(vote.startCell.y * tileSize + tileSize / 2, vote.startCell.x * tileSize  + tileSize / 2, vote.endCell.y * tileSize  + tileSize / 2, vote.endCell.x * tileSize  + tileSize / 2);
                    this.ctx.fillStyle = "#000000";
                    this.ctx.fillText(""+value, vote.endCell.y * tileSize + tileSize / 2, vote.endCell.x * tileSize + tileSize / 2);
                }
            }
        },

        arrow : function(fromx, fromy, tox, toy) {
            console.log(fromx+" "+fromy+" "+tox+" "+toy);
            let headlen = 10;
            this.ctx.lineWidth = 10;
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

        colorFromVote : function(vote) {
            return "#" + (2 * vote.startCell.x + 1).toString(16) + (2 * vote.endCell.x + 1).toString(16) + (2 * vote.endCell.x + 1).toString(16) + (2 * vote.endCell.y + 1).toString(16) + (2 * vote.startCell.y + 1).toString(16) + (2 * vote.endCell.y + 1).toString(16);
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
