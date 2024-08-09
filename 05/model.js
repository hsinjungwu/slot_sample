import Symbol from "./globedef/symbol.js"
import Table from "./globedef/table.js"

class Model {
    // 範例隨便寫
    constructor() {
        this.TableStrip = {
            [Table.MainGame1]: [
                ['H1', 'H2', 'H3', 'B', 'B', 'B'],
                ['H1', 'H2', 'H3', 'B', 'B', 'B'],
                ['H1', 'H2', 'H3', 'B', 'B', 'B'],
                ['H1', 'H2', 'H3', 'B', 'B', 'B'],
                ['H1', 'H2', 'H3', 'B', 'B', 'B'],
            ],
            [Table.FreeGame1]: [
                ['H1', 'H2', 'H3'],
                ['H1', 'H2', 'H3'],
                ['H1', 'H2', 'H3'],
                ['H1', 'H2', 'H3'],
                ['H1', 'H2', 'H3'],
            ]
        }

        this.PayTable = {
            [Symbol.W]: [0, 0, 0, 0, 0, 0],
            [Symbol.H1]: [0, 0, 0, 20, 100, 500],
            [Symbol.H2]: [0, 0, 0, 20, 80, 300],
            [Symbol.H3]: [0, 0, 0, 15, 50, 200],
            [Symbol.H4]: [0, 0, 0, 15, 50, 150],
            [Symbol.N1]: [0, 0, 0, 5, 25, 100],
            [Symbol.N2]: [0, 0, 0, 5, 25, 100],
            [Symbol.N3]: [0, 0, 0, 5, 20, 80],
            [Symbol.N4]: [0, 0, 0, 5, 20, 80],
            [Symbol.N5]: [0, 0, 0, 5, 15, 80],
            [Symbol.N6]: [0, 0, 0, 5, 15, 80],
            [Symbol.F]: [0, 0, 0, 2, 5, 50]
        }

        this.FreeSpinCount = [0, 0, 0, 10, 15, 25]

        this.BonusSpinCount = 3 // 獎勵遊戲觸發次數

        this.MinTriggerBonusCount = 6 // 最少觸發獎勵遊戲的 B 個數

        this.BonusMultiple = {
            [Symbol.B1]: 1,
            [Symbol.B5]: 5,
            [Symbol.B10]: 10
        }

        this.MG_BonusSymbols = new Map([
            // 圖標B 變成 B1, B5, B10 的比例是 8:1:1
            [Symbol.B1, 8],
            [Symbol.B5, 1],
            [Symbol.B10, 1],
        ])

        this.BG_BonusSymbols = new Map([
            [Symbol.Empty, 90], // 沒中
            [Symbol.B1, 3],
            [Symbol.B5, 3],
            [Symbol.B10, 3],
            [Symbol.B_Collect, 1],
        ])
    }
}

export default Model