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
        this.BaseBetAmt = 20;
        this.GameTable = Table.MainGame1;
        this.Rngmgr = new Rngmgr();
        this.Model = new Model();
        this.ReelX = 6;
        this.ReelY = 5;

        // 完整消除歷程結果
        this.AllOutputs = [];
        this.Input = null;
    }

    // spin 紀錄的結果會是 [贏, 贏, ...., 贏, 沒得分或觸發 FG]
    spin(ipt) {
        this.Input = ipt;
        this.GameTable = this.Input.Table
        if (this.GameTable == Table.MainGame1) {
            this.Denom = this.Input.BetAmt / this.BaseBetAmt
        }
        this.AllOutputs = [];

        let output = new GameOutput();
        this._genRngs(output);
        this._genSymbolFrame(output);
        this._calcNormalWin(output);

        while (output.WinAmt > 0) {
            // 有贏分才加入
            this.AllOutputs.push(output)

            let next = new GameOutput();
            this._genRespinRngs(output, next)
            this._genSymbolFrame(next);
            this._calcNormalWin(next);
            output = next
        }

        // 這時的 output 是沒有 normal win 的狀態，再檢查是否觸發 fg
        this._calcScatterPay(output);
        this.AllOutputs.push(output)

        return this.AllOutputs;
    }

    _genRngs(output) {
        let rngs = []

        for (let x = 0; x < this.ReelX; x++) {
            let reelLen = this.Model.TableStrip[this.Input.Table][x].length;
            rngs.push(this.Rngmgr.Next(reelLen));
        }

        output.RngFrame = []
        for (let x = 0; x < this.ReelX; x++) {
            let reelLen = this.Model.TableStrip[this.Input.Table][x].length;
            let col = [];
            for (let y = 0; y < this.ReelY; y++) {
                col.push((y + rngs[x]) % reelLen);

            }
            output.RngFrame.push(col);
        }
    }

    _genSymbolFrame(output) {
        output.SymbolFrame = [];
        for (let x = 0; x < this.ReelX; x++) {
            let reel = this.Model.TableStrip[this.Input.Table][x];
            let col = [];
            for (let y = 0; y < this.ReelY; y++) {
                let pos = output.RngFrame[x][y];
                col.push(reel[pos]);
            }
            output.SymbolFrame.push(col);
        }
        return output
    }

    _calcNormalWin(output) {
        for (var sb in this.Model.PayTable) {
            // 一般算分不處理 SCATTER
            if (sb == Symbol.F) {
                continue
            }

            let numberOfKind = 0 // 圖標個數
            let winPosititon = [] // 每個滾輪贏分圖標位置格式範例 [[0,1],[2],[0]]

            //預設沒有百搭            
            for (let x = 0; x < this.ReelX; x++) {
                let tmpPos = []
                for (let y = 0; y < this.ReelY; y++) {
                    if (output.SymbolFrame[x][y] == sb) {
                        numberOfKind++
                        tmpPos.push(y)
                    }
                }
                winPosititon.push(tmpPos)
            }

            let win = this.Model.pay(sb, numberOfKind) * this.Denom;
            if (win == 0) {
                // 沒得分，跳過
                continue
            }

            let winline = new GameLine(sb, numberOfKind, winPosititon, win);
            output.WinLines.push(winline);
            output.NormalWinAmt += winline.WinAmt;
        }

        if (output.WinLines.length > 0) {
            output.WinType = WinType.WIN_MG;
        }
    }

    _genRespinRngs(old, next) {
        for (let x = 0; x < this.ReelX; x++) {
            let col = old.RngFrame[x]
            let top = col[0]

            let chk = []
            for (let y = 0; y < this.ReelY; y++) {
                chk.push(col[y])
            }

            for (let n = 0; n < old.WinLines.length; n++) {
                let wl = old.Winlines[n]

                for (let y = 0; y < wl.WinPosition; y++) {
                    chk[x][y] = -1 // 標記這個位置會消除
                }
            }

            let nextCol = []
            for (let y = col.length - 1; y >= 0; y--) {
                // 由下往上紀錄不會消除的 RNG
                if (chk[y] > -1) {
                    nextCol.push(chk[y])
                }
            }

            // 如果 tmp 數量不夠，往上補滿
            let reelLen = this.Model.TableStrip[this.Input.Table][x].length;
            while (nextCol.length < this.ReelY) {
                nextCol.push((top - 1) % reelLen)
                top--
            }

            next.RngFrame.push(nextCol)
        }
    }

    _calcScatterPay(output) {
        let fCount = 0
        let winPosititon = []

        for (let x = 0; x < this.ReelX; x++) {
            let tmpPos = []
            for (let y = 0; y < this.ReelY; y++) {
                if (output.SymbolFrame[x][y] == Symbol.F) {
                    fCount++
                    tmpPos.push(y)
                }
            }
            winPosititon.push(tmpPos)
        }

        if (fCount >= this.Model.MinScatterCount) {
            let win = this.Model.pay(Symbol.F, fCount) * this.BaseBetAmt * this.Denom;
            output.WinLines.push(new GameLine(Symbol.F, fCount, winPosititon, win));
            output.ScatterAmt = win;
            output.WinType = WinType.WIN_FG;
            if (this.Input.Table == Table.MainGame1) {
                output.FreeSpins = this.Model.TriggerFreeSpins
            } else {
                output.FreeSpins = this.Model.RetriggerFreeSpins
            }
        }
    }
}
