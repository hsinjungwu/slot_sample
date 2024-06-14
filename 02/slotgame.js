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
        this.BaseBetAmt = 88;
        this.GameTable = Table.MainGame1;
        this.Rngmgr = new Rngmgr();
        this.Model = new Model();
        this.ReelX = 5;
        this.ReelY = 3;
        this.Output = null;
        this.Input = null;
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
        for (var sb in this.Model.PayTable) {
            // 一般算分不處理 SCATTER
            if (sb == Symbol.F) {
                continue
            }

            let stack = 1 //堆疊數
            let numberOfKind = 0 //連線長度
            let winPosititon = [] // 每個滾輪贏分圖標位置格式 [[0,1],[2],[0]]
            let tmpCount = 0 // 暫存值，每個滾輪特定圖標個數
            let tmpPos = [] // 暫存值，每個滾輪贏分圖標位置

            // 預設 way game 的首輪不放置百搭
            for (let y = 0; y < this.ReelY; y++) {
                if (this.Output.SymbolFrame[0][y] == sb) {
                    tmpCount++
                    tmpPos.push(y)
                }
            }

            if (tmpCount == 0) {
                //第一輪沒有指定圖標 sb 就跳過
                continue
            }

            numberOfKind++
            stack *= tmpCount
            winPosititon.push(tmpPos)

            for (let x = 1; x < this.ReelX; x++) {
                tmpCount = 0
                tmpPos = []
                for (let y = 0; y < this.ReelY; y++) {
                    if (this.Output.SymbolFrame[x][y] == sb || this.Output.SymbolFrame[x][y] == Symbol.W) {
                        tmpCount++
                        tmpPos.push(y)
                    }
                }
                if (tmpCount == 0) {
                    break
                } else {
                    numberOfKind++
                    stack *= tmpCount
                }
            }

            let win = this.Model.PayTable[sb][numberOfKind] * stack * this.Denom;
            if (win == 0) {
                // 沒得分，跳過
                continue
            }

            // 贏分線代號，非 line game 的情形，內部習慣用第幾條當作代號
            let lineNo = this.Output.WinLines.length + 1
            let winline = new GameLine(lineNo, sb, numberOfKind, winPosititon, win);
            this.Output.WinLines.push(winline);
            this.Output.NormalWinAmt += winline.WinAmt;
        }


        if (this.Output.WinLines.length > 0) {
            this.Output.WinType = WinType.WIN_MG;
        }
    }

    _calcScatterPay() {
        // F 連續
        let cfCount = 0
        let winPosititon = []

        for (let x = 0; x < this.ReelX; x++) {
            let tmpCount = 0
            let tmpPos = []
            for (let y = 0; y < this.ReelY; y++) {
                // 因為 W 可以代替 F
                if (this.Output.SymbolFrame[x][y] == Symbol.F || this.Output.SymbolFrame[x][y] == Symbol.W) {
                    tmpCount++
                    tmpPos.push(y)
                }
            }
            if (tmpCount == 0) {
                break
            } else {
                cfCount++
                winPosititon.push(tmpPos)
            }
        }

        // 因為不是固定場數，所以計算超過觸發個數
        if (cfCount >= this.Model.MinScatterCount) {
            let win = this.Model.PayTable[Symbol.F][cfCount] * this.BaseBetAmt * this.Denom;
            // 觸發 Free Game 贏分線代號為 100
            this.Output.WinLines.push(new GameLine(100, Symbol.F, cfCount, winPosititon, win));
            this.Output.ScatterAmt = win;
            this.Output.WinType = WinType.WIN_FG;
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
