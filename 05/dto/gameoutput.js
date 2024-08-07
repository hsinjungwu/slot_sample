import WinType from "../globedef/wintype.js";

export default class GameOutput {
    constructor() {
        // 一般得分贏得金額
        this.NormalWinAmt = 0;

        // Scatter Pay
        this.ScatterAmt = 0;

        // 停輪盤面，提供前端使用 
        this.SymbolFrame = null;

        // 停滾盤面每格的 RNG
        this.RngFrame = null;

        // 每條贏分線
        this.WinLines = [];

        // 贏分類型
        this.WinType = WinType.NO_WIN

        // 觸發免費遊戲場次
        this.FreeSpinCount = 0

        // 觸發獎勵遊戲場次
        this.BonusSpinCount = 0

        // 當次累計的獎勵倍數
        this.BonusAccMultiple = 0

        // 當次累計的獎勵金額
        this.BonusAccWin = 0

        // 獎勵圖標鎖定位置
        this.BonusFrame = []
    }
}