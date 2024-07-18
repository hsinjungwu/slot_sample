import Table from "./globedef/table.js"

class Model {
    constructor() {

        this.PayTable = {
            [Table.MG_Monster1]: new Map([
                [50, 1], [15, 2], [8, 87], [0, 910]
            ]),
            [Table.MG_Monster2]: new Map([
                [20, 5], [10, 12], [5, 108], [0, 875]
            ]),
            [Table.MG_Monster3]: new Map([
                [15, 5], [5, 82], [3, 88], [0, 825]
            ]),
            [Table.MG_Monster4]: new Map([
                [8, 17], [3, 110], [2, 123], [0, 750]
            ]),
            [Table.MG_Monster5]: new Map([
                [4, 90], [2, 150], [1, 110], [0, 650]
            ]),


            [Table.MG_ShinyPig]: new Map([
                [0, 97500],
                [-1, 1250], // -1 表示觸發閃亮金豬
                [5, 38], [10, 125], [15, 313], [20, 363], [25, 263], [30, 150]
            ]),


            [Table.MG_PunkPig]: new Map([
                [0, 9798000],
                [-1, 80800], // -1 表示觸發朋克金豬
                [5, 6060], [10, 18180], [15, 24240], [20, 30300], [25, 20604],
                [30, 9696], [35, 4848], [40, 3636], [45, 2424], [50, 1212]
            ]),


            [Table.MG_Treasure]: new Map([
                [100, 10], [50, 50], [40, 15], [30, 10], [25, 110], [20, 20],
                [15, 0], [12, 0], [10, 0], [8, 0], [5, 0], [3, 0], [2, 0],
                [1, 1500], [0, 8285]
            ])
        }

        this.MonsterMultiple = {
            [Table.MG_Monster1]: new Map([
                [1, 881], [2, 84], [5, 30], [8, 5]
            ]),
            [Table.MG_Monster2]: new Map([
                [1, 871], [2, 91], [5, 30], [8, 8]
            ]),
            [Table.MG_Monster3]: new Map([
                [1, 850], [2, 112], [5, 30], [8, 8]
            ]),
            [Table.MG_Monster4]: new Map([
                [1, 800], [2, 160], [5, 30], [8, 10]
            ]),
            [Table.MG_Monster5]: new Map([
                [1, 882], [2, 82], [5, 28], [8, 8]
            ]),

            [Table.MG_Treasure]: new Map([
                [1, 900], [2, 29], [3, 9], [5, 3]
            ])
        }

        this.BounsTable = {
            [Table.FG_ShinyPig]: [
                new Map([
                    [1, 16], [2, 10], [3, 5], [5, 4], [10, 1], [0, 45], [-1, 19]
                ]),
                new Map([
                    [1, 20], [2, 10], [3, 5], [5, 4], [10, 1], [0, 60], [-1, 0]
                ]),
                new Map([
                    [1, 20], [2, 10], [3, 5], [5, 4], [10, 1], [0, 60], [-1, 0]
                ])
            ],
            [Table.FG_PunkPig_5x]: [
                new Map([
                    [1, 2250], [2, 500], [3, 400], [5, 200], [10, 50], [0, 4600], [-1, 2000]
                ]),
                new Map([
                    [1, 2250], [2, 500], [3, 400], [5, 200], [10, 50], [0, 6600], [-1, 0]
                ]),
                new Map([
                    [1, 2250], [2, 500], [3, 400], [5, 200], [10, 50], [0, 6600], [-1, 0]
                ])
            ],
            [Table.FG_PunkPig_10x]: [
                new Map([
                    [1, 2590], [2, 500], [3, 200], [5, 100], [10, 10], [0, 5100], [-1, 1500]
                ]),
                new Map([
                    [1, 2300], [2, 500], [3, 200], [5, 100], [10, 10], [0, 6890], [-1, 0]
                ]),
                new Map([
                    [1, 2300], [2, 500], [3, 200], [5, 100], [10, 10], [0, 6890], [-1, 0]
                ])
            ]
        }

        this.PunkPig = new Map([
            [Table.FG_PunkPig_5x, 35], [Table.FG_PunkPig_10x, 5]
        ])

        this.TriggerFreeSpins = 5 // mg => fg

        this.RetriggerFreeSpins = 1 // fg => fg

        this.MaxFreeSpins = 20

    }
}

export default Model