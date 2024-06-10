export default class GameLine {
    constructor(no, symbol, numberOfKind, winPosition, win) {
        this.LineNo = no
        this.symbol = symbol
        this.NumberOfKind = numberOfKind
        this.WinPosition = winPosition
        this.WinAmt = win
    }
}