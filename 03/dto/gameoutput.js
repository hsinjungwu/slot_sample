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

        // 觸發免費遊戲場數
        this.FreeSpins = 0

        // 新增內容 👇

        /** 套用倍數多獲得金額。
        * 例如這次下注原始金額是 100，打雷倍數是 50，所以實際獲得 5000。
        * 但在之前的所有 output 的 NormalWinAmt 加總是 100 
        * 所以這裡的值是 5000-100 = 4900
        * 這部分擺 5000 或 4900 其實沒差，可以根據你們的規則記，只要帳對得起來就好
        */
        this.MultipleWinAmt = 0 // 加總

        // 無法再消的時候，計算打雷贏分倍數
        this.FinalMultiple = 0

        // 免費遊戲的累計倍數
        this.FgAccumulateMultiple = 0

        // 紀錄每一個位置放的倍數
        this.MultipleFrame = []
        // 新增內容 👆
    }
}