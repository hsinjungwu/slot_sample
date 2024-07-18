import GameInput from "./dto/gameinput.js";
import Table from "./globedef/table.js";
import WinType from "./globedef/wintype.js";
import ArcadeGame from "./arcadegame.js";

function main() {

    const startTime = new Date();
    let game = new ArcadeGame()

    let playBet = 10
    let loop = 10000 * 100
    let step = 1
    if (loop > 100) {
        step = loop / 100
    }

    let totalMgWin = 0
    let totalFgWin = 0
    let totalBet = 0
    let fgHit = 0
    for (let l = 0; l < loop; l++) {

        if (l % step == 0) {
            console.log(l / step + "%");
        }

        let mi = new GameInput();
        mi.Table = Table.MG_PunkPig;
        mi.BetAmt = playBet

        let mo = game.spinMG(mi);


        totalBet += playBet
        totalMgWin += mo.NormalWinAmt

        if (mo.WinType == WinType.WIN_FG) {
            fgHit++
            let startM = 1
            switch (mo.FgTable) {
                case Table.FG_PunkPig_5x:
                    startM = 5
                    break
                case Table.FG_PunkPig_10x:
                    startM = 10
                    break
            }

            let totalFs = mo.FreeSpins

            // 每一次 free spin
            for (let fs = 0; fs < totalFs; fs++) {
                let fi = new GameInput()
                fi.Table = mo.FgTable
                fi.FgMultiple = startM

                let fo = game.spinFG(fi)
                for (let i = 0; i < fo.NormalWinAmts.length; i++) {
                    totalFgWin += fo.NormalWinAmts[i]
                }

                totalFs += fo.FreeSpins
                if (totalFs > game.Model.MaxFreeSpins) {
                    totalFs = game.Model.MaxFreeSpins
                }
                startM++
            }
        }
    }

    const endTime = new Date();

    const executionTime = endTime - startTime;

    const minutes = Math.floor(executionTime / 60000);
    const seconds = ((executionTime % 60000) / 1000).toFixed(0);

    console.log(`執行時間：${minutes} 分 ${seconds} 秒`);
    let mgrtp = totalMgWin / totalBet
    let fgrtp = totalFgWin / totalBet
    let rtp = mgrtp + fgrtp
    console.log(`Mg = ${(mgrtp * 100).toFixed(2)}%, Fg = ${(fgrtp * 100).toFixed(2)}%`);
    let fgFreq = 0
    if (fgHit > 0) {
        fgFreq = loop / fgHit
    }
    console.log(`RTP = ${(rtp * 100).toFixed(2)}%, FG-Freq =  ${(fgFreq).toFixed(2)}`);
}

main();
