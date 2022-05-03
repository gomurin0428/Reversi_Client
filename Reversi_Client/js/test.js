const url_GetReversibleStone = "https://48w3zmrxq8.execute-api.ap-northeast-1.amazonaws.com/beta";
const url_PutStoneToSpecifiedSiteAndReverse = "https://ts903e9o66.execute-api.ap-northeast-1.amazonaws.com/beta";
const url_GetOpponentsStoneSite = "https://1wzqtw4cgg.execute-api.ap-northeast-1.amazonaws.com/beta";
const url_white_stone = "";
const url_black_stone = "";
class Board {
    constructor() {
        this.arr = [];
        this.player = 1081344;
        this.opponent = 2113536;
        this.turn = 0;
    }
    doClick(i, j) {
        console.log("doClick:player:" + this.player);
        console.log("doClick:opponent:" + this.opponent);
        var index = 6 * i + j;
        var canvas = document.getElementById("mass" + index);
        var xmlhttp = new XMLHttpRequest();
        var url = url_GetReversibleStone;
        xmlhttp.open("POST", url, false);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.onload = async () => {
            var response = this.convertBitsTo01(Number(JSON.parse(xmlhttp.responseText).PuttableStoneSite));
            if (response.charAt(35 - index) == "1") {
                var tmp = 0;
                var two = 1;
                for (let ii = 0; ii < index; ii++) {
                    two *= 2;
                }
                tmp = two;
                await this.callPutStoneToSpecifiedSiteAndReverse(two, true);
                await this.sleepByPromise(1000);
                const opponentStonesite = await this.callGetOpponentsStoneSite();
                await this.sleepByPromise(1000);
                await this.callPutStoneToSpecifiedSiteAndReverse(opponentStonesite, false);
            }
        };
        var parameters = JSON.stringify({ "PlayerAndOpponent": (this.player + ";" + this.opponent) });
        xmlhttp.send(parameters);
    }
    initDrawBoard() {
        var boardWrapper = document.getElementById("boardWrapper");
        for (let i = 0; i < 6; i++) {
            var div = document.createElement("div");
            div.setAttribute("id", "raw" + i);
            div.setAttribute("style", "margin:0 auto;width:1000px;height:116px;padding:0px;");
            boardWrapper.appendChild(div);
            for (let j = 0; j < 6; j++) {
                var canvas = document.createElement("canvas");
                var canvasContext = canvas.getContext("2d");
                canvas.width = 116;
                canvas.height = 116;
                canvas.setAttribute("style", "border:1px solid black;margin:0px;padding:0px;");
                canvas.id = ("mass" + (6 * i + j));
                var f = this.doClick.bind(this, i, j);
                this.arr.push(f);
                canvas.addEventListener("click", f, false);
                canvasContext.fillStyle = "green";
                canvasContext.fillRect(0, 0, 120, 120);
                div.appendChild(canvas);
            }
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                var index = 6 * i + j;
                var tmp = this.convertBitsTo01(this.player);
                if (tmp.charAt(index) == "1") {
                    var canvas = document.getElementById("mass" + index);
                    var canvasContext = canvas.getContext("2d");
                    canvasContext.fillStyle = "black";
                    canvasContext.arc(58, 58, 39.6, 0, 6.28);
                    canvasContext.fill();
                }
            }
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                var index = 6 * i + j;
                var tmp = this.convertBitsTo01(this.opponent);
                if (tmp.charAt(index) == "1") {
                    var canvas = document.getElementById("mass" + index);
                    var canvasContext = canvas.getContext("2d");
                    canvasContext.fillStyle = "white";
                    canvasContext.arc(58, 58, 39.6, 0, 6.28);
                    canvasContext.fill();
                }
            }
        }
    }
    convertBitsTo01(bits) {
        return bits.toString(2).padStart(36, "0");
    }
    convert01ToBits(str) {
        var ret = 0;
        for (let i = 0; i < 36; i++) {
            if (str[i] == "1") {
                ret += 1 << i;
            }
        }
        return ret;
    }
    callPutStoneToSpecifiedSiteAndReverse(site, isPlayer) {
        const p = new Promise((resolve, reject) => {
            var xmlhttp = new XMLHttpRequest();
            var url = url_PutStoneToSpecifiedSiteAndReverse;
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.onload = () => {
                var response = JSON.parse(xmlhttp.responseText).PuttedPlayerAndOpponent;
                console.log("response:" + response);
                var puttedPlayer = this.convertBitsTo01(Number(response.split(";")[0]));
                var puttedOpponent = this.convertBitsTo01(Number(response.split(";")[1]));
                if (isPlayer) {
                    this.drawPlayer(puttedPlayer, this.convertBitsTo01(this.player), this.convertBitsTo01(this.opponent));
                    this.drawOpponent(puttedOpponent, this.convertBitsTo01(this.player), this.convertBitsTo01(this.opponent));
                    this.player = Number(response.split(";")[0]);
                    this.opponent = Number(response.split(";")[1]);
                }
                else {
                    this.drawPlayer(puttedOpponent, this.convertBitsTo01(this.player), this.convertBitsTo01(this.opponent));
                    this.drawOpponent(puttedPlayer, this.convertBitsTo01(this.player), this.convertBitsTo01(this.opponent));
                    this.player = Number(response.split(";")[1]);
                    this.opponent = Number(response.split(";")[0]);
                }
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 6; j++) {
                        var index = 6 * i + j;
                        var canvas = document.getElementById("mass" + index);
                        canvas.removeEventListener("click", this.arr[index]);
                        var f = this.doClick.bind(this, i, j);
                        this.arr[index] = f;
                        canvas.addEventListener("click", f, false);
                    }
                }
                resolve(1);
            };
            var parameters;
            if (isPlayer) {
                parameters = JSON.stringify({ "PutStoneSiteAndPlayerAndOpponent": (site + ";" + this.player + ";" + this.opponent) });
            }
            else {
                parameters = JSON.stringify({ "PutStoneSiteAndPlayerAndOpponent": (site + ";" + this.opponent + ";" + this.player) });
            }
            xmlhttp.send(parameters);
        });
        return p;
    }
    callGetOpponentsStoneSite() {
        const p = new Promise((resolve, reject) => {
            var xmlhttp = new XMLHttpRequest();
            var url = url_GetOpponentsStoneSite;
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            var parameters = JSON.stringify({ "PlayerAndOpponent": (this.opponent + ";" + this.player) });
            xmlhttp.onload = () => {
                var response = JSON.parse(xmlhttp.responseText).OpponentsStoneSite;
                console.log("response:" + response);
                var opponentsStoneSite = Number(response);
                resolve(opponentsStoneSite);
            };
            xmlhttp.send(parameters);
        });
        return p;
    }
    async drawPlayer(newPlayer, oldPlayer, oldOppoent) {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                var index = 6 * i + j;
                if (newPlayer.charAt(35 - index) == "1") {
                    if (oldOppoent.charAt(35 - index) == "1") {
                        for (let k = 0; k < 20; k++) {
                            await this.drawReversingAnimation(k, 20, index, "black", "white");
                        }
                        var canvas = document.getElementById("mass" + index);
                        var canvasContext = canvas.getContext("2d");
                        canvasContext.fillStyle = "green";
                        canvasContext.fillRect(0, 0, 130, 130);
                        canvasContext.fill();
                        canvasContext.fillStyle = "black";
                        canvasContext.arc(58, 58, 39.6, 0, 6.28);
                        canvasContext.fill();
                    }
                    else if (oldPlayer.charAt(35 - index) == "0") {
                        var canvas = document.getElementById("mass" + index);
                        var canvasContext = canvas.getContext("2d");
                        canvasContext.fillStyle = "green";
                        canvasContext.fillRect(0, 0, 120, 120);
                        canvasContext.fill();
                        canvasContext.fillStyle = "black";
                        canvasContext.arc(58, 58, 39.6, 0, 6.28);
                        canvasContext.fill();
                    }
                }
            }
        }
    }
    async drawOpponent(newOpponent, oldPlayer, oldOppoent) {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                var index = 6 * i + j;
                if (newOpponent.charAt(35 - index) == "1") {
                    if (oldPlayer.charAt(35 - index) == "1") {
                        for (let k = 0; k < 20; k++) {
                            await this.drawReversingAnimation(k, 20, index, "white", "black");
                        }
                        var canvas = document.getElementById("mass" + index);
                        var canvasContext = canvas.getContext("2d");
                        canvasContext.fillStyle = "green";
                        canvasContext.fillRect(0, 0, 130, 130);
                        canvasContext.fill();
                        canvasContext.fillStyle = "white";
                        canvasContext.arc(58, 58, 39.6, 0, 6.28);
                        canvasContext.fill();
                    }
                    else if (oldOppoent.charAt(35 - index) == "0") {
                        var canvas = document.getElementById("mass" + index);
                        var canvasContext = canvas.getContext("2d");
                        canvasContext.fillStyle = "white";
                        canvasContext.scale(1, 1);
                        canvasContext.arc(58, 58, 39.6, 0, 6.28);
                        canvasContext.fill();
                    }
                }
            }
        }
    }
    drawReversingAnimation(count, countMax, index, newColor, oldColor) {
        const p = new Promise((resolve, reject) => {
            if (count > countMax) {
                resolve(1);
            }
            var canvas = document.getElementById("mass" + index);
            var canvasContext = canvas.getContext("2d");
            var percent = (((count + 1)) / countMax);
            if (newColor == "white") {
                canvasContext.fillStyle = "white";
            }
            else {
                canvasContext.fillStyle = "black";
            }
            canvasContext.beginPath();
            canvasContext.scale(1, percent);
            canvasContext.arc(58, (((percent) * (58))), 39.6, 0, 6.28);
            canvasContext.scale(1, (1.0 / percent));
            canvasContext.closePath();
            canvasContext.fill();
            console.log("canvasContext:" + canvasContext.fillStyle);
            console.log(count);
            console.log(percent);
            setTimeout(() => { resolve(1); }, 1);
        });
        return p;
    }
    sleepByPromise(sec) {
        return new Promise(resolve => setTimeout(resolve, sec));
    }
}
function main() {
    var board = new Board();
    board.initDrawBoard();
}
window.addEventListener('load', function () {
    main();
});
//# sourceMappingURL=test.js.map