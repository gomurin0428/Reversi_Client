const url_GetReversibleStone = "https://48w3zmrxq8.execute-api.ap-northeast-1.amazonaws.com/beta";
const url_PutStoneToSpecifiedSiteAndReverse ="https://ts903e9o66.execute-api.ap-northeast-1.amazonaws.com/beta";
const url_GetOpponentsStoneSite = "https://1wzqtw4cgg.execute-api.ap-northeast-1.amazonaws.com/beta";

class Board{
    //playerは必ず黒。
    player:Number;
    opponent:Number;
    turn:number;
    arr:any[] = [];
    constructor(){
        this.player = 1081344;
        this.opponent = 2113536;
        this.turn = 0;
    }

    doClick(i:number,j:number){
        console.log("doClick:player:"+this.player);
        console.log("doClick:opponent:"+this.opponent);
        var index = 6*i+j;
        var canvas = document.getElementById("mass"+index);
        var xmlhttp = new XMLHttpRequest();
        var url =url_GetReversibleStone;
        xmlhttp.open("POST", url, false);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.onload = async () => {
            var response = this.convertBitsTo01(Number(JSON.parse(xmlhttp.responseText).PuttableStoneSite));
            if(response.charAt(35-index)=="1"){
                var tmp = 0;
                var two = 1
                for(let ii=0;ii<index;ii++){
                    two *= 2;
                }
                tmp = two;
                await this.callPutStoneToSpecifiedSiteAndReverse(two,true);
                const opponentStonesite = await this.callGetOpponentsStoneSite();
                await this.callPutStoneToSpecifiedSiteAndReverse(opponentStonesite,false);
            } 
          };
        var parameters = JSON.stringify({"PlayerAndOpponent":(this.player+";"+this.opponent)});
        xmlhttp.send(parameters);
    }

    initDrawBoard(){
        var boardWrapper = document.getElementById("boardWrapper");
        for(let i=0;i<6;i++){
            var div = document.createElement("div");
            div.setAttribute("id","raw"+i);
            div.setAttribute("style","margin:0px;width:500px;height:58px;padding:0px;");
            boardWrapper.appendChild(div);
            for(let j=0;j<6;j++){
                var canvas = document.createElement("canvas");
                var canvasContext = canvas.getContext("2d");
                canvas.width=58;
                canvas.height=58;
                canvas.setAttribute("style","border:1px solid black;margin:0px;padding:0px;");
                canvas.id=("mass"+(6*i+j));
                var f = this.doClick.bind(this,i,j)
                this.arr.push(f);
                canvas.addEventListener("click",f,false);
                canvasContext.fillStyle="green";
                canvasContext.fillRect(0,0,60,60);
                div.appendChild(canvas);
            }
        }

        for(let i=0;i<6;i++){
            for(let j=0;j<6;j++){
                var index = 6*i+j;
                var tmp = this.convertBitsTo01(this.player)
                if(tmp.charAt(index)=="1"){
                    var canvas = <HTMLCanvasElement> document.getElementById("mass"+index);
                    var canvasContext = canvas.getContext("2d");
                    canvasContext.fillStyle="black";
                    canvasContext.arc(29,29,28,0,6.28);
                    canvasContext.fill();
                }
            }
        }

        for(let i=0;i<6;i++){
            for(let j=0;j<6;j++){
                var index = 6*i+j;
                var tmp = this.convertBitsTo01(this.opponent)
                if(tmp.charAt(index)=="1"){
                    var canvas = <HTMLCanvasElement> document.getElementById("mass"+index);
                    var canvasContext = canvas.getContext("2d");
                    canvasContext.fillStyle="white";
                    canvasContext.arc(29,29,28,0,6.28);
                    canvasContext.fill();
                }
            }
        }
        
    }

    convertBitsTo01(bits:Number){
        return bits.toString(2).padStart(36,"0")
    }

    convert01ToBits(str:string){
        var ret = 0;
        for(let i=0;i<36;i++){
            if(str[i]=="1"){
                ret += 1 << i;
            }
        }
        return ret;
    }

    callPutStoneToSpecifiedSiteAndReverse(site:number,isPlayer:boolean){
        const p = new Promise((resolve,reject)=>{
            var xmlhttp = new XMLHttpRequest();
            var url =url_PutStoneToSpecifiedSiteAndReverse;
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.onload = () => {
                var response = <string>JSON.parse(xmlhttp.responseText).PuttedPlayerAndOpponent;
                console.log("response:"+response);
                var puttedPlayer = this.convertBitsTo01(Number(response.split(";")[0]))
                var puttedOpponent = this.convertBitsTo01(Number(response.split(";")[1]))
                if(isPlayer){
                    this.drawPlayer(puttedPlayer);
                    this.drawOpponent(puttedOpponent);
                    this.player=Number(response.split(";")[0]);
                    this.opponent=Number(response.split(";")[1]);
                }else{
                    this.drawPlayer(puttedOpponent);
                    this.drawOpponent(puttedPlayer);
                    this.player=Number(response.split(";")[1]);
                    this.opponent=Number(response.split(";")[0]);
                }
                for(let i=0;i<6;i++){
                    for(let j=0;j<6;j++){
                        var index = 6*i+j;
                        var canvas = <HTMLCanvasElement> document.getElementById("mass"+index);
                        canvas.removeEventListener("click",this.arr[index]);
                        var f = this.doClick.bind(this,i,j);
                        this.arr[index] = f;
                        canvas.addEventListener("click",f,false);
                    }
                }
                resolve(1);
              };
            
            var parameters
            if(isPlayer){
                parameters = JSON.stringify({"PutStoneSiteAndPlayerAndOpponent":(site+";"+this.player+";"+this.opponent)});
            }else{
                parameters = JSON.stringify({"PutStoneSiteAndPlayerAndOpponent":(site+";"+this.opponent+";"+this.player)});
            }
            xmlhttp.send(parameters);
        })
        return p;
    }

    callGetOpponentsStoneSite(){

        const p = new Promise<number>((resolve,reject)=>{
            var xmlhttp = new XMLHttpRequest();
            var url =url_GetOpponentsStoneSite;
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            var parameters = JSON.stringify({"PlayerAndOpponent":(this.opponent+";"+this.player)});
            xmlhttp.onload = ()=>{
                var response = <string>JSON.parse(xmlhttp.responseText).OpponentsStoneSite;
                console.log("response:"+response);
                var opponentsStoneSite = Number(response);
                resolve(opponentsStoneSite);
            }
            xmlhttp.send(parameters);
        })

        return p;
    }

    drawPlayer(player:string){
        for(let i=0;i<6;i++){
            for(let j=0;j<6;j++){
                var index = 6*i+j;
                if(player.charAt(35-index)=="1"){
                    var canvas = <HTMLCanvasElement> document.getElementById("mass"+index);
                    var canvasContext = canvas.getContext("2d");
                    canvasContext.fillStyle="black";
                    canvasContext.arc(29,29,28,0,6.28);
                    canvasContext.fill();
                }
            }
        }
    }

    drawOpponent(opponent:string){
        for(let i=0;i<6;i++){
            for(let j=0;j<6;j++){
                var index = 6*i+j;
                if(opponent.charAt(35-index)=="1"){
                    var canvas = <HTMLCanvasElement> document.getElementById("mass"+index);
                    var canvasContext = canvas.getContext("2d");
                    canvasContext.fillStyle="white";
                    canvasContext.arc(29,29,28,0,6.28);
                    canvasContext.fill();
                }
            }
        }
    }

}



function main(){
    var board = new Board();
    board.initDrawBoard();
}

window.addEventListener('load', function(){
    main();
});
