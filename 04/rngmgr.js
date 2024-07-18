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

    /**
     * 根據 (項目, 權重)表 回傳選出的權重與隨機項目
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
        let tmp = chosenWeight

        for (let [item, weight] of data) {
            if (tmp < weight) {
                return [chosenWeight, item]
            } else {
                tmp -= weight
                last = item
            }
        }
        return [chosenWeight, last]
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
}