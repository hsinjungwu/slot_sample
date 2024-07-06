import GameInput from "./dto/gameinput.js";
import Table from "./globedef/table.js";
import WinType from "./globedef/wintype.js";
import Rngmgr from "./rngmgr.js";
import SimulationData from "./simulateData.js";
import SlotGame from "./slotgame.js";

function main() {

    const startTime = new Date();
    let game = new SlotGame()

    let playBet = 20 * 3
    let loop = 10000
    let step = 1
    if (loop > 100) {
        step = loop / 100
    }

    let total = new SimulationData(loop)
    for (let l = 0; l < loop; l++) {
        let tmpWin = 0

        if (l % step == 0) {
            console.log(l / step + "%");
        }

        let mi = new GameInput();
        mi.Table = Table.MainGame1;
        mi.BetAmt = playBet

        let mos = game.spin(mi);

        total.Bet += playBet
        for (let i = 0; i < mos.length; i++) {
            let mo = mos[i]
            let winSum = mo.NormalWinAmt + mo.MultipleWinAmt
            total.MgWin += winSum
            tmpWin += winSum
        }

        let lmo = mos[mos.length - 1]

        if (lmo.WinType == WinType.WIN_FG) {
            tmpWin += lmo.ScatterAmt
            total.FgWin += lmo.ScatterAmt
            let totalFs = lmo.FreeSpins

            // 累積倍數
            let accuM = 0

            // 每一次 free spin
            for (let fs = 0; fs < totalFs; fs++) {
                let fi = new GameInput()
                fi.Table = Table.FreeGame1

                // 新增內容 👇
                // 設定累積倍數，一開始是 0 
                fi.FgAccumulateMultiple = accuM
                // 新增內容 👆

                let fos = game.spin(fi)

                for (let i = 0; i < fos.length; i++) {
                    let fo = fos[i]
                    let winSum = fo.NormalWinAmt + fo.ScatterAmt + fo.MultipleWinAmt
                    total.FgWin += winSum
                    tmpWin += winSum
                    if (fo.WinType == WinType.WIN_FG) {
                        totalFs += fo.FreeSpins
                        if (totalFs > game.Model.MaxFreeSpins) {
                            totalFs = game.Model.MaxFreeSpins
                        }
                    }

                }

                // 新增內容 👇
                // 更新累積倍數
                accuM = fos[fos.length - 1].FgAccumulateMultiple
                // 新增內容 👆
            }
        }
        total.WinSquare += tmpWin * tmpWin
        if (tmpWin > 0) {
            total.Hit++
        }
    }

    total.show()
    const endTime = new Date();

    const executionTime = endTime - startTime;

    const minutes = Math.floor(executionTime / 60000);
    const seconds = ((executionTime % 60000) / 1000).toFixed(0);

    console.log(`執行時間：${minutes} 分 ${seconds} 秒`);
}

main();
