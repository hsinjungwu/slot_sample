import GameOutput from './dto/gameoutput.js';
import GameLine from './dto/gameline.js';
import Symbol from './globedef/symbol.js';
import Table from './globedef/table.js';
import WinType from './globedef/wintype.js';
import Model from './model.js';
import Rngmgr from './rngmgr.js';


export default class SlotGame {
    constructor() {
        this.Denom = 0;
        this.BaseBetAmt = 60;
        this.GameTable = Table.MainGame1;
        this.Rngmgr = new Rngmgr();
        this.Model = new Model();
        this.ReelX = 5;
        this.ReelY = 4;
        this.Output = null;
        this.Input = null;
        this.WinLinePattern = [
            [1, 1, 1, 1, 1],//1
            [2, 2, 2, 2, 2],
            [0, 0, 0, 0, 0],
            [3, 3, 3, 3, 3],
            [1, 1, 0, 1, 1],//5
            [2, 2, 3, 2, 2],
            [0, 0, 1, 2, 3],
            [3, 3, 2, 1, 0],
            [1, 2, 3, 2, 1],
            [2, 1, 0, 1, 2],//10
            [0, 1, 1, 1, 0],
            [3, 2, 2, 2, 3],
            [1, 1, 2, 3, 3],
            [2, 2, 1, 0, 0],
            [0, 0, 1, 1, 2],//15
            [3, 3, 2, 2, 1],
            [1, 1, 2, 1, 1],
            [2, 2, 1, 2, 2],
            [0, 1, 2, 3, 3],
            [3, 2, 1, 0, 0],//20
            [1, 0, 1, 2, 3],
            [2, 3, 2, 1, 0],
            [0, 1, 2, 3, 2],
            [3, 2, 1, 0, 1],
            [1, 0, 1, 2, 1],
            [2, 3, 2, 1, 2],
            [0, 1, 2, 1, 0],
            [3, 2, 1, 2, 3],
            [1, 0, 0, 1, 2],
            [2, 3, 3, 2, 1],//30
            [0, 1, 0, 1, 0],
            [3, 2, 3, 2, 3],
            [1, 2, 1, 0, 1],
            [2, 1, 2, 3, 2],
            [0, 1, 2, 2, 3],
            [3, 2, 1, 1, 0],
            [1, 1, 0, 1, 2],
            [2, 2, 3, 2, 1],
            [0, 1, 1, 0, 0],
            [3, 2, 2, 3, 3],//40
            [1, 0, 1, 0, 1],
            [2, 3, 2, 3, 2],
            [0, 1, 1, 2, 3],
            [3, 2, 2, 1, 0],
            [1, 2, 1, 0, 0],
            [2, 1, 2, 3, 3],
            [0, 1, 0, 1, 2],
            [3, 2, 3, 2, 1],
            [1, 2, 1, 2, 3],
            [2, 1, 2, 1, 0],//50
            [0, 1, 1, 1, 2],
            [3, 2, 2, 2, 1],
            [1, 1, 2, 1, 0],
            [2, 2, 1, 2, 3],
            [0, 1, 0, 0, 1],
            [3, 2, 3, 3, 2],
            [1, 0, 1, 0, 0],
            [2, 3, 2, 3, 3],
            [0, 1, 1, 2, 2],
            [3, 2, 2, 1, 1],//60
        ];
        this.calcFrame = []
    }

    spin(ipt) {
        this.Input = ipt;
        this.GameTable = this.Input.Table
        if (this.GameTable == Table.MainGame1) {
            this.Denom = this.Input.BetAmt / this.BaseBetAmt
        }
        this.Output = new GameOutput();

        this._genRngs();
        this._genSymbolFrame();
        this._calcNormalWin();
        this._calcScatterPay();

        return this.Output;
    }

    _genRngs() {
        let rngs = []
        if (this.Input.QA_RNG == null) {
            for (let x = 0; x < this.ReelX; x++) {
                let reelLen = this.Model.TableStrip[this.Input.Table][x].length;
                rngs.push(this.Rngmgr.Next(reelLen));
            }
        } else {
            for (let x = 0; x < this.Input.QA_RNG.length; x++) {
                rngs.push(this.Input.QA_RNG[x])
            }
        }

        this.Output.RngFrame = []
        for (let x = 0; x < this.ReelX; x++) {
            let reelLen = this.Model.TableStrip[this.Input.Table][x].length;
            let col = [];
            for (let y = 0; y < this.ReelY; y++) {
                col.push((y + rngs[x]) % reelLen);

            }
            this.Output.RngFrame.push(col);
        }
    }

    _genSymbolFrame() {
        this.Output.SymbolFrame = [];
        for (let x = 0; x < this.ReelX; x++) {
            let reel = this.Model.TableStrip[this.Input.Table][x];
            let col = [];
            for (let y = 0; y < this.ReelY; y++) {
                let pos = this.Output.RngFrame[x][y];
                col.push(reel[pos]);
            }
            this.Output.SymbolFrame.push(col);
        }
    }

    _calcNormalWin() {
        this.calcFrame = []
        for (let x = 0; x < this.ReelX; x++) {
            let col = []
            for (let y = 0; y < this.ReelY; y++) {
                col.push(this.Output.SymbolFrame[x][y]);
            }
            this.calcFrame.push(col);
        }

        if (this.GameTable == Table.FreeGame1) {
            for (let x = 0; x < this.ReelX; x++) {
                for (let y = 0; y < this.ReelY; y++) {
                    if (this.Input.StickyPosition[x][y]) {
                        this.calcFrame[x][y] = Symbol.W;
                    }
                }
            }
        }

        for (let lno = 0; lno < this.WinLinePattern.length; lno++) {
            let pattern = this.WinLinePattern[lno]
            let wCount = 0;
            let l = pattern.length;
            let leadSymbol = "";
            for (let x = 0; x < l; x++) {
                let y = pattern[x];
                let sb = this.calcFrame[x][y];
                if (sb == Symbol.W) {
                    wCount++;
                } else {
                    leadSymbol = sb;
                    break
                }
            }


            let nCount = 0;
            // 一般算分不處理 SCATTER
            if (leadSymbol != Symbol.F) {
                // 不是 w 5 連線
                if (wCount < l) {
                    nCount = wCount + 1;
                    for (let x = nCount; x < l; x++) {
                        let y = pattern[x];
                        let sb = this.calcFrame[x][y];
                        if (sb == leadSymbol || sb == Symbol.W) {
                            nCount++;
                        } else {
                            break;
                        }
                    }
                }
            }

            let wWin = this.Model.PayTable[Symbol.W][wCount];
            let nWin = this.Model.PayTable[leadSymbol][nCount];

            if (wWin == 0 && nWin == 0) {
                continue;
            }

            let winline = null
            if (wWin >= nWin) {
                winline = new GameLine(lno, Symbol.W, wCount, pattern, wWin * this.Denom);
            } else {
                winline = new GameLine(lno, leadSymbol, nCount, pattern, nWin * this.Denom);
            }
            this.Output.WinLines.push(winline);
            this.Output.NormalWinAmt += winline.WinAmt;
        }

        if (this.Output.WinLines.length > 0) {
            this.Output.WinType = WinType.WIN_MG;
        }

        if (this.GameTable == Table.FreeGame1) {
            this.Output.StickyPosition = []
            for (let x = 0; x < this.ReelX; x++) {
                let stickyCheck = []
                for (let y = 0; y < this.ReelY; y++) {
                    stickyCheck.push(this.calcFrame[x][y] == Symbol.W)
                }
                this.Output.StickyPosition.push(stickyCheck)
            }
        }
    }

    _calcScatterPay() {
        // F 不連續，且每個滾輪都沒有堆疊的 F 
        let pos = [];
        let sfCount = 0;
        for (let x = 0; x < this.ReelX; x++) {
            pos.push(-1);
            for (let y = 0; y < this.ReelY; y++) {
                if (this.Output.SymbolFrame[x][y] == Symbol.F) {
                    sfCount++;
                    pos[x] = y;
                    break;
                }
            }
        }


        let fsCount = this.Model.FreeSpinCount[sfCount]
        if (fsCount > 0) {
            let win = this.Model.PayTable[Symbol.F][sfCount] * this.BaseBetAmt * this.Denom;
            // 觸發 Free Game 贏分線代號為 100
            this.Output.WinLines.push(new GameLine(100, Symbol.F, sfCount, pos, win));
            this.Output.ScatterAmt = win;
            this.Output.WinType = WinType.WIN_FG;
            this.Output.FreeSpinCount = fsCount;

            this.Output.StickyPosition = []
            for (let x = 0; x < this.ReelX; x++) {
                let stickyCheck = []
                for (let y = 0; y < this.ReelY; y++) {
                    stickyCheck.push(false)
                }
                this.Output.StickyPosition.push(stickyCheck)
            }
        }
    }

    _debug() {
        for (let y = 0; y < this.ReelY; y++) {
            let tmp = ""
            for (let x = 0; x < this.ReelX; x++) {
                tmp += this.Output.SymbolFrame[x][y] + "(" + this.Output.RngFrame[x][y] + ")\t"
            }
            console.log(tmp)
        }
        console.log("n-win = %f", this.Output.NormalWinAmt)
    }
}
