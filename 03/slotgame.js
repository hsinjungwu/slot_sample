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

        while (output.NormalWinAmt > 0) {
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


        // 新增內容 👇

        // 設定倍數長在哪些 RNG
        this._setMultipleForLast(output)

        // 將 last 的倍數資訊更新到之前的結果
        this._updateAllOutputMultiple(output)

        // 更新最後累積的倍數以及倍數贏分
        this._updateFinalWinForLast(output)

        // 新增內容 👆

        this.AllOutputs.push(output)

        return this.AllOutputs;
    }

    _genRngs(output) {
        let rngs = []

        // for (let x = 0; x < this.ReelX; x++) {
        //     let reelLen = this.Model.TableStrip[this.Input.Table][x].length;
        //     rngs.push(this.Rngmgr.Next(reelLen));            
        // }
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
        next.RngFrame = []
        for (let x = 0; x < this.ReelX; x++) {
            let col = old.RngFrame[x]

            let top = col[0] // 最上層的 RNG

            let chk = []
            for (let y = 0; y < this.ReelY; y++) {
                chk.push(col[y])
            }

            // 根據贏分線去標記消除的位置
            for (let n = 0; n < old.WinLines.length; n++) {
                let wl = old.WinLines[n]
                let wcol = wl.WinPosition[x]
                for (let i = 0; i < wcol.length; i++) {
                    let y = wcol[i]
                    chk[y] = -1 // 標記這個位置會消除
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

            // push 是加到後面，所以還要再逆向
            let revertCol = []
            for (let i = nextCol.length - 1; i >= 0; i--) {
                revertCol.push(nextCol[i])
            }

            next.RngFrame.push(revertCol)
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

    // 新增內容 👇

    _setMultipleForLast(lastOutput) {
        // 初始化 last 的 MultipleFrame
        lastOutput.MultipleFrame = []
        for (let x = 0; x < this.ReelX; x++) {
            let col = []
            for (let y = 0; y < this.ReelY; y++) {
                col.push(0)
            }
            lastOutput.MultipleFrame.push(col)
        }

        // 可以設計成如果觸發 FG 就不給倍數，讓贏分集中在免費遊戲的體驗
        // if (lastOutput.WinType == WIN_FG) {
        //     return
        // }


        let mcMap = this.Model.MultipleCountTable[this.Input.Table]
        let multipleCount = this.Rngmgr.RandomOneByMap(mcMap)

        // 沒有倍數
        if (multipleCount == 0) {
            return
        }

        // 倍數表
        let multipleWeight = this.Model.MultipleWeightTable[this.Input.Table]

        // 倍數標記位置
        let markFrame = this.Rngmgr.GenMultipleMarkFrame(this.ReelX, this.ReelY, multipleCount)

        for (let x = 0; x < this.ReelX; x++) {
            for (let y = 0; y < this.ReelY; y++) {
                if (markFrame[x][y]) {
                    // 將 MultipleFrame 的對應位置填入倍數
                    let m = this.Rngmgr.RandomOneByMap(multipleWeight)
                    lastOutput.MultipleFrame[x][y] = m
                    lastOutput.FinalMultiple += m
                }
            }
        }
    }

    _updateAllOutputMultiple(lastOutput) {
        // 初始化每一個 output 的 MultipleFrame        
        for (let i = 0; i < this.AllOutputs.length; i++) {
            for (let x = 0; x < this.ReelX; x++) {
                let col = []
                for (let y = 0; y < this.ReelY; y++) {
                    col.push(0)
                }
                this.AllOutputs[i].MultipleFrame.push(col)
            }
        }

        for (let x = 0; x < this.ReelX; x++) {
            for (let y = 0; y < this.ReelY; y++) {
                let m = lastOutput.MultipleFrame[x][y]
                if (m == 0) {
                    continue
                }

                // 倍數所在的 rng 
                let m_rng = lastOutput.RngFrame[x][y]

                for (let i = 0; i < this.AllOutputs.length; i++) {
                    let opt = this.AllOutputs[i]

                    let hasRng = false
                    for (let yi = 0; yi < this.ReelY; yi++) {
                        if (opt.RngFrame[x][yi] == m_rng) {
                            opt.MultipleFrame[x][yi] = m
                            hasRng = true
                            break
                        }
                    }

                    if (!hasRng) {
                        /** 
                         * 舊的 output 沒有這個 rng 的話，在滾輪傳統掉落模式(也就是依照輪帶位置掉落)下
                         * 新的 output 理論上不會有。如果有表示整個滾輪帶太短或是都消光，這種情形很罕見
                         * 
                         * 如果真的不幸遇到這樣，可以考慮新增一個類別 Cell。
                         * 然後 Output 的所有 Frame 相關屬性可以整合變成 Frame = Cell[][] (cell 二維陣列) 
                         * Cell 可以記錄原始圖案(symbol), Multiplel(被覆蓋的倍數), CascadingTimes(第幾消)
                         * 
                         * 這部分就看要怎麼實作了
                        */
                        break
                    }
                }

            }
        }
    }

    _updateFinalWinForLast(lastOutput) {
        if (this.Input.GameTable == Table.MainGame1) {
            if (lastOutput.FinalMultiple == 0) {
                return
            }

            let totalWin = 0
            for (let i = 0; i < this.AllOutputs.length; i++) {
                totalWin += this.AllOutputs[i].NormalWinAmt
            }

            // 這裡是設計成倍數只套用一般贏分，所以把下面這段註解
            // totalWin += lastOutput.ScatterAmt

            // 額外贏分用結算倍數去算
            lastOutput.MultipleWinAmt = totalWin * (lastOutput.FinalMultiple - 1)
        } else {
            if (lastOutput.FinalMultiple == 0) {
                lastOutput.FgAccumulateMultiple = this.Input.FgAccumulateMultiple
                return
            }

            let totalWin = 0
            for (let i = 0; i < this.AllOutputs.length; i++) {
                totalWin += this.AllOutputs[i].NormalWinAmt
            }

            // 這裡是設計成倍數只套用一般贏分，所以把下面這段註解
            // totalWin += lastOutput.ScatterAmt

            if (totalWin > 0) {
                // 有贏分也有出現倍數 更新累積倍數
                lastOutput.FgAccumulateMultiple = this.Input.FgAccumulateMultiple + lastOutput.FinalMultiple

                // 額外贏分用累計倍數去算
                lastOutput.MultipleWinAmt = totalWin * (lastOutput.FgAccumulateMultiple - 1)
            } else {
                // 沒有贏分但有出現倍數的情況，累積倍數不會更新
                lastOutput.FgAccumulateMultiple = this.Input.FgAccumulateMultiple
                lastOutput.MultipleWinAmt = 0
            }
        }
    }

    // 新增內容 👆
}
