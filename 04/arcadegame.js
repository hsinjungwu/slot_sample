import GameOutput from './dto/gameoutput.js';
import Table from './globedef/table.js';
import WinType from './globedef/wintype.js';
import Model from './model.js';
import Rngmgr from './rngmgr.js';
import BonusOutput from './dto/bonusoutput.js';


export default class ArcadeGame {
    constructor() {
        this.Denom = 0;
        this.BaseBetAmt = 1;
        this.GameTable = Table.MG_Monster1;
        this.Rngmgr = new Rngmgr();
        this.Model = new Model();
        this.Input = null;
    }

    spinMG(ipt) {
        this.Input = ipt;
        this.GameTable = this.Input.Table
        this.Denom = this.Input.BetAmt / this.BaseBetAmt

        let opt = new GameOutput()
        opt.Table = this.GameTable

        let payTable = this.Model.PayTable[this.GameTable]
        let value = this.Rngmgr.RandomOneByMap(payTable)
        opt.Rng = value[0]

        let win = value[1]
        if (win == 0) {
            return opt
        }

        if (this.GameTable == Table.MG_ShinyPig) {
            if (win == -1) {
                opt.WinType = WinType.WIN_FG
                opt.FgTable = Table.FG_ShinyPig
                opt.FreeSpins = this.Model.TriggerFreeSpins
            } else {
                opt.WinType = WinType.WIN_MG
                opt.NormalWinAmt = win * this.Denom
            }
        } else if (this.GameTable == Table.MG_PunkPig) {
            if (win == -1) {
                opt.WinType = WinType.WIN_FG
                let val = this.Rngmgr.RandomOneByMap(this.Model.PunkPig)
                opt.FgTable = val[1]
                opt.FreeSpins = this.Model.TriggerFreeSpins
            } else {
                opt.WinType = WinType.WIN_MG
                opt.NormalWinAmt = win * this.Denom
            }
        } else {
            opt.WinType = WinType.WIN_MG
            let multipleMap = this.Model.MonsterMultiple[this.GameTable]
            let val = this.Rngmgr.RandomOneByMap(multipleMap)
            opt.Multiple = val[1]
            opt.NormalWinAmt = win * opt.Multiple * this.Denom
        }

        return opt
    }

    spinFG(ipt) {
        this.Input = ipt;
        this.GameTable = this.Input.Table

        let opt = new BonusOutput()
        opt.Multiple = this.Input.FgMultiple


        let bonusTables = this.Model.BounsTable[this.GameTable]
        for (let i = 0; i < 3; i++) {
            let value = this.Rngmgr.RandomOneByMap(bonusTables[i])
            opt.Rngs.push(value[0])
            let win = value[1]
            if (win == -1) {
                opt.NormalWinAmts.push(0)
                opt.FreeSpins = this.Model.RetriggerFreeSpins
            } else {
                opt.NormalWinAmts.push(win * opt.Multiple * this.Denom)
            }
        }
        return opt
    }
}
