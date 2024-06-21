import GameInput from "./dto/gameinput.js";
import Table from "./globedef/table.js";
import WinType from "./globedef/wintype.js";
import Rngmgr from "./rngmgr.js";
import SimulationData from "./simulateData.js";
import SlotGame from "./slotgame.js";

function main() {

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

        let mo = game.spin(mi);

        total.Bet += playBet
        total.MgWin += mo.NormalWinAmt
        tmpWin += mo.NormalWinAmt

        if (mo.WinType == WinType.WIN_FG) {
            tmpWin += mo.ScatterAmt
            total.FgWin += mo.ScatterAmt
            total.FgCount++

            // 已玩幾回合的免費遊戲
            let playedRound = 1

            // 再觸發的免費遊戲
            let retriggerRound = 0

            // 前端 => 後端 => 數值，讓數值知道玩家選哪一種類型
            let playerRandomChoice = new Rngmgr()
            let fgID = playerRandomChoice.Next(5) // 隨機五選一
            let fgTable = game.Model.FgLuckyDraw[fgID].Table
            let fgCount = game.Model.FgLuckyDraw[fgID].Count

            while (true) {
                for (let fs = 0; fs < fgCount; fs++) {
                    let fi = new GameInput()
                    fi.Table = fgTable
                    let fo = game.spin(fi)
                    total.FgWin += (fo.NormalWinAmt + fo.ScatterAmt)
                    tmpWin += (fo.NormalWinAmt + fo.ScatterAmt)
                    if (fo.WinType == WinType.WIN_FG) {
                        retriggerRound++
                    }
                }

                // 遊玩回合數超過最大上限
                if (playedRound == game.Model.MaxFgRound) {
                    break
                }

                // 沒有再觸發
                if (retriggerRound == 0) {
                    break
                } else {
                    retriggerRound--
                    playedRound++
                    // 前端 => 後端 => 數值，讓數值知道玩家選哪一種類型
                    fgID = playerRandomChoice.Next(5) // 隨機五選一
                    fgTable = game.Model.FgLuckyDraw[fgID].Table
                    fgCount = game.Model.FgLuckyDraw[fgID].Count
                }
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
