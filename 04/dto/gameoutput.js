import WinType from "../globedef/wintype.js";

export default class GameOutput {
    constructor() {
        // 一般得分贏得金額
        this.NormalWinAmt = 0;

        // RNG
        this.Rng = 0;

        // 觸發免費遊戲場數
        this.FreeSpins = 0

        // 隨機倍數
        this.Multiple = 0

        // 打的怪
        this.Table = null

        // 觸發免費遊戲使用的表
        this.FgTable = null
    }
}