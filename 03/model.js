import Symbol from "./globedef/symbol.js"
import Table from "./globedef/table.js"

class Model {
    constructor() {
        this.TableStrip = {
            [Table.MainGame1]: [
                ['H2', 'N2', 'H2', 'N3', 'H1', 'H1', 'H3', 'N3', 'H3', 'F', 'N1', 'N1', 'N1', 'N1'],
                ['N3', 'N3', 'H2', 'N2', 'H4', 'H3', 'H2', 'N3', 'N5', 'F', 'N2', 'N2', 'N2', 'N2'],
                ['N2', 'N5', 'H3', 'N3', 'N4', 'H2', 'H3', 'N3', 'H3', 'F', 'N3', 'N3', 'N3', 'N3'],
                ['N2', 'N2', 'H3', 'N3', 'N3', 'H2', 'N4', 'H4', 'N4', 'F', 'N4', 'N4', 'N4', 'N4'],
                ['H4', 'N3', 'N1', 'H3', 'H3', 'N5', 'N3', 'H3', 'N1', 'F', 'N5', 'N5', 'N5', 'N5'],
                ['N5', 'H4', 'N3', 'N3', 'N2', 'N2', 'H1', 'H1', 'H3', 'N1', 'N2', 'N3', 'N4', 'N5']
            ],
            [Table.FreeGame1]: [
                ['H2', 'N2', 'H2', 'N3', 'H1', 'H1', 'H3', 'N3', 'H3', 'F', 'N1', 'N1', 'N1', 'N1'],
                ['N3', 'N3', 'H2', 'N2', 'H4', 'H3', 'H2', 'N3', 'N5', 'F', 'N2', 'N2', 'N2', 'N2'],
                ['N2', 'N5', 'H3', 'N3', 'N4', 'H2', 'H3', 'N3', 'H3', 'F', 'N3', 'N3', 'N3', 'N3'],
                ['N2', 'N2', 'H3', 'N3', 'N3', 'H2', 'N4', 'H4', 'N4', 'F', 'N4', 'N4', 'N4', 'N4'],
                ['H4', 'N3', 'N1', 'H3', 'H3', 'N5', 'N3', 'H3', 'N1', 'F', 'N5', 'N5', 'N5', 'N5'],
                ['N5', 'H4', 'N3', 'N3', 'N2', 'N2', 'H1', 'H1', 'H3', 'N1', 'N2', 'N3', 'N4', 'N5']
            ],
        }

        this.PayTable = {
            [Symbol.H1]: [0, 200, 500, 1000],
            [Symbol.H2]: [0, 50, 200, 500],
            [Symbol.H3]: [0, 40, 100, 300],
            [Symbol.H4]: [0, 30, 40, 240],
            [Symbol.H5]: [0, 0, 0, 0],
            [Symbol.N1]: [0, 20, 30, 200],
            [Symbol.N2]: [0, 16, 24, 160],
            [Symbol.N3]: [0, 10, 20, 100],
            [Symbol.N4]: [0, 8, 18, 80],
            [Symbol.N5]: [0, 5, 15, 40],
            [Symbol.N6]: [0, 0, 0, 0],
            [Symbol.F]: [0, 0, 0, 0, 3, 5, 100]
        }

        // 最少觸發 FG 的 Scatter 個數
        this.MinScatterCount = 4

        this.TriggerFreeSpins = 15 // mg => fg

        this.RetriggerFreeSpins = 5 // fg => fg

        this.MaxFreeSpins = 100

        // 新增內容 👇

        /** 
         * 單個位置打雷的倍數權重表
         * 下面範例是主遊戲跟免費遊戲的權重都不同
         * 在實務設計上甚至是可以多個 Free Game 表。例如 
         * 1. FG1 比較容易中獎，但打雷的倍數最多就 50x
         * 2. FG2 比較難中獎，但打雷部倍數就是 30x 起，最多 500x          
         */
        this.MultipleWeightTable = {
            [Table.MainGame1]: new Map([
                [2, 70],
                [3, 20],
                [5, 10]
            ]),
            [Table.FreeGame1]: new Map([
                // 加總是 100000
                [10, 33333], // 10 倍是 33.333%
                [20, 33333], // 10 倍是 33.333%
                [50, 33333], // 10 倍是 33.333%
                [500, 1]    // 500 倍是  0.001%
            ])
        }

        // 一次遊戲完整歷程會出現幾個位置打雷
        this.MultipleCountTable = {
            [Table.MainGame1]: new Map([
                [0, 70], // 沒打雷的機率 70%
                [1, 20], // 1 個位置打雷的機率 20%
                [2, 10]  // 2 個位置打雷的機率 10%
            ]),
            [Table.FreeGame1]: new Map([
                // 加總是 100000
                [0, 33333], // 沒打雷的機率 33.333%
                [3, 33333], // 3 個位置打雷的機率 33.333%
                [5, 33333], // 5 個位置打雷的機率 33.333%
                [8, 1]      // 8 個位置打雷的機率 0.001%
            ])
        }

        // 新增內容 👆
    }

    pay(symbol, cnt) {
        let c = cnt
        if (symbol == Symbol.F) {
            if (cnt > 6) {
                c = 6
            }
        } else {
            if (cnt < 8) {
                c = 0
            } else if (cnt < 10) {
                c = 1
            } else if (cnt < 12) {
                c = 2
            } else {
                c = 3
            }
        }

        return this.PayTable[symbol][c]
    }
}

export default Model