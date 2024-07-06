import crypto from 'crypto';


export default class Rngmgr {
    constructor() { }

    /**
     * 生成密碼學安全的在 [0, n) 之間的隨機整數，參考 chatgpt
     * @param {number} n 指定上限 
     * @returns {number}
     */

    Next(n) {
        // 需要一个 Buffer 来存储随机字节
        const randomBuffer = crypto.randomBytes(4);
        // 从 Buffer 中读取一个 32 位无符号整数
        const randomInt = randomBuffer.readUInt32BE(0);
        // 使用取模运算将随机数缩放到 [0, n) 范围
        return randomInt % n;
    }

    // 新增內容 👇

    /**
     * 根據 (項目, 權重)表 回傳隨機項目
     * @param {Map} data 
     * @returns 
     */
    RandomOneByMap(data) {
        // 權重加總
        let weightSum = 0
        for (let [_, value] of data) {
            weightSum += value
        }

        let last = null
        let chosenWeight = this.Next(weightSum) // 選出的權重           

        for (let [item, weight] of data) {
            if (chosenWeight < weight) {
                return item
            } else {
                chosenWeight -= weight
                last = item
            }
        }
        return last
    }

    /**
     * 使用 Fisher-Yates 演算法隨機打亂數組中的元素
    */
    _shuffle(array) {
        let currentIndex = array.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = this.Next(currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    /**
     * 取得隨機倍數標記位置
     * @param {number} xmax 滾輪個數 ReelX
     * @param {number} ymax 滾輪高度 ReelY
     * @param {number} n 倍數個數
     */
    GenMultipleMarkFrame(xmax, ymax, n) {
        let allid = []
        for (let i = 0; i < xmax * ymax; i++) {
            allid.push(i)
        }
        let shuffledArray = this._shuffle(allid);
        let ids = shuffledArray.slice(0, n); // 取前 n 個

        let multipleMarkFrame = [];

        for (let x = 0; x < xmax; x++) {
            let col = [];
            for (let j = 0; j < ymax; j++) {
                col.push(false);
            }
            multipleMarkFrame.push(col);
        }

        for (let i = 0; i < ids.length; i++) {
            let id = ids[i]
            let x = Math.floor(id / ymax) // 第幾個滾輪
            let y = id % ymax // 滾輪的位置            
            multipleMarkFrame[x][y] = true
        }

        return multipleMarkFrame
    }

    // 新增內容 👆
}