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

}