import GameInput from "./dto/gameinput.js";
import Table from "./globedef/table.js";
import WinType from "./globedef/wintype.js";
import SimulationData from "./simulateData.js";
import SlotGame from "./slotgame.js";

function main() {
    // 记录开始时间
    const startTime = new Date();
    let game = new SlotGame()

    let playBet = 60 * 3
    let loop = 1000 * 10000
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

        // mi.QA_RNG = [45, 45, 45, 45, 45]

        let mo = game.spin(mi);

        // game._debug()

        total.Bet += playBet
        total.MgWin += mo.NormalWinAmt
        tmpWin += mo.NormalWinAmt

        if (mo.WinType == WinType.WIN_FG) {
            tmpWin += mo.ScatterAmt
            total.FgWin += mo.ScatterAmt
            total.FgCount++

            let fgLockWild = mo.StickyPosition
            for (let fs = 0; fs < mo.FreeSpinCount; fs++) {
                let fi = new GameInput()
                fi.Table = Table.FreeGame1
                fi.StickyPosition = fgLockWild
                // fi.QA_RNG = [2, 7, 40, 26, 32]
                let fo = game.spin(fi)
                // game._debug()

                total.FgWin += (fo.NormalWinAmt + fo.ScatterAmt)
                tmpWin += (fo.NormalWinAmt + fo.ScatterAmt)
                fgLockWild = fo.StickyPosition
            }
        }
        total.WinSquare += tmpWin * tmpWin
        if (tmpWin > 0) {
            total.Hit++
        }
    }

    total.show()
    // 记录结束时间
    const endTime = new Date();

    // 计算执行时间（单位：毫秒）
    const executionTime = endTime - startTime;

    // 将毫秒转换为分钟和秒
    const minutes = Math.floor(executionTime / 60000);
    const seconds = ((executionTime % 60000) / 1000).toFixed(0);

    console.log(`執行時間：${minutes} 分 ${seconds} 秒`);
}

main();
