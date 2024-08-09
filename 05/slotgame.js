import GameOutput from './dto/gameoutput.js';
import Symbol from './globedef/symbol.js';
import Table from './globedef/table.js';
import WinType from './globedef/wintype.js';
import Model from './model.js';
import Rngmgr from './rngmgr.js';


export default class SlotGame {
    constructor() {
        this.Denom = 0;
        this.BaseBetAmt = 1;
        this.GameTable = Table.MainGame1;
        this.Rngmgr = new Rngmgr();
        this.Model = new Model();
        this.ReelX = 5;
        this.ReelY = 3;
        this.Output = null;
        this.Input = null;
        this.WinLinePattern = [
            [1, 1, 1, 1, 1],
            [2, 2, 2, 2, 2],
            [0, 0, 0, 0, 0],
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
        if (this.GameTable == Table.BonusGame1) {
            this._checkBgBonus()
        } else {
            /** 正常 spin 流程，略過不寫
             * this._genRngs();
             * this._genSymbolFrame();
             * this._calcNormalWin();
             * this._calcScatterPay();             
             */
            this._testFrame()
            this._checkMgBonus()
        }

        return this.Output;
    }

    // 檢查主遊戲是否觸發 Bonus Game
    _checkMgBonus() {
        let multiple = 0
        let count = 0
        let tmpFrame = []

        for (let x = 0; x < this.ReelX; x++) {
            let col = []
            for (let y = 0; y < this.ReelY; y++) {
                if (this.Output.SymbolFrame[x][y] == Symbol.B) {
                    count++

                    let bSymbol = this.Rngmgr.RandomOneByMap(this.Model.MG_BonusSymbols)
                    // 將註記圖標換成實際獎勵圖標
                    this.Output.SymbolFrame[x][y] = bSymbol
                    multiple += this.Model.BonusMultiple[bSymbol]

                    col.push(bSymbol)
                } else {
                    col.push(Symbol.Empty)
                }
            }
            tmpFrame.push(col)
        }

        if (count >= this.Model.MinTriggerBonusCount) {
            this.Output.BonusSpinCount = this.Model.BonusSpinCount
            this.Output.WinType = WinType.WIN_BG
            this.Output.BonusFrame = tmpFrame
            this.Output.BonusAccMultiple = multiple
            this.Output.BonusAccWin = multiple * this.BaseBetAmt * this.Denom
        }
    }

    _checkBgBonus() {
        this.Output.BonusFrame = this.Input.BonusFrame
        this.Output.BonusAccMultiple = this.Input.BonusAccMultiple


        let count = 0
        for (let x = 0; x < this.ReelX; x++) {
            for (let y = 0; y < this.ReelY; y++) {
                if (this.Output.BonusFrame[x][y] == Symbol.Empty) {
                    let bSymbol = this.Rngmgr.RandomOneByMap(this.Model.BG_BonusSymbols)
                    if (bSymbol == Symbol.Empty) {
                        continue
                    }

                    count++
                    this.Output.BonusFrame[x][y] = bSymbol
                    if (bSymbol == Symbol.B_Collect) {
                        this.Output.BonusAccMultiple *= 2
                    } else {
                        this.Output.BonusAccMultiple += this.Model.BonusMultiple[bSymbol]
                    }
                }
            }
        }

        this.Output.BonusAccWin = this.Output.BonusAccMultiple * this.BaseBetAmt * this.Denom
        if (count > 0) {
            this.Output.WinType = WinType.WIN_BG
        } else {
            this.Output.WinType = WinType.NO_WIN
        }
    }

    // 測試設定假盤面
    _testFrame() {
        this.Output.SymbolFrame = [
            ["H1", "H2", "H3"],
            ["H1", "H2", "H3"],
            ["H1", "H2", "H3"],
            ["B", "B", "B"],
            ["B", "B", "B"]
        ]
    }
}
