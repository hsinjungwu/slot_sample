import GameInput from "./dto/gameinput.js";
import Table from "./globedef/table.js";
import WinType from "./globedef/wintype.js";
import SlotGame from "./slotgame.js";

function main() {
    const startTime = new Date();
    let game = new SlotGame()

    let playBet = 3
    let loop = 100 * 10000
    let step = 1
    if (loop > 100) {
        step = loop / 100
    }

    let totalBet = 0
    let totalWin = 0

    for (let l = 0; l < loop; l++) {
        if (l % step == 0) {
            console.log(l / step + "%");
        }

        let mi = new GameInput();
        mi.Table = Table.MainGame1;
        mi.BetAmt = playBet

        let mo = game.spin(mi);
        totalBet += playBet

        let tmpWin = 0

        if (mo.WinType == WinType.WIN_BG) {
            let bi = new GameInput()
            bi.Table = Table.BonusGame1
            bi.BonusAccMultiple = mo.BonusAccMultiple
            bi.BonusFrame = mo.BonusFrame

            for (let bs = 0; bs < mo.BonusSpinCount; bs++) {
                let bo = game.spin(bi)
                if (bo.WinType == WinType.WIN_BG) {
                    bs = -1
                }

                bi.BonusAccMultiple = bo.BonusAccMultiple
                bi.BonusFrame = bo.BonusFrame
                tmpWin = bo.BonusAccWin
            }
        }

        totalWin += tmpWin
    }

    // 记录结束时间
    const endTime = new Date();

    // 计算执行时间（单位：毫秒）
    const executionTime = endTime - startTime;

    // 将毫秒转换为分钟和秒
    const minutes = Math.floor(executionTime / 60000);
    const seconds = ((executionTime % 60000) / 1000).toFixed(0);

    console.log(`執行時間：${minutes} 分 ${seconds} 秒`);
    let rtp = totalWin / totalBet
    console.log(`RTP = ${(rtp * 100).toFixed(2)}%`);
}

main();
