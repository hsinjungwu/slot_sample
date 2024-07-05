export default class SimulationData {
    constructor(loop) {
        this.Bet = 0
        this.MgWin = 0
        this.FgWin = 0
        this.SpinCount = loop
        this.FgCount = 0
        this.WinSquare = 0
        this.Hit = 0
    }

    show() {
        let totalWin = this.MgWin + this.FgWin
        console.log("total Win = %f, total Bet = %f, RTP = %s", totalWin, this.Bet, this._rtp(totalWin))
        console.log("mg rtp = %s, fg rtp = %s", this._rtp(this.MgWin), this._rtp(this.FgWin))
        console.log("Hit Rate = %s, fg freq = %s, cv = %s", this._hitRate(), this._fgFreq(), this._cv())
    }

    _fgFreq() {
        if (this.FgCount == 0) {
            return "none"
        } else {
            return `${(this.SpinCount / this.FgCount).toFixed(2)}`
        }
    }

    _rtp(win) {
        let rtp = win / this.Bet
        return `${(rtp * 100).toFixed(2)}%`;
    }

    _hitRate() {
        return `${(this.Hit * 100 / this.SpinCount).toFixed(2)}%`
    }

    _cv() {
        let totalWin = this.MgWin + this.FgWin
        let d = this.WinSquare - totalWin * totalWin / this.SpinCount
        let m = this.SpinCount - 1
        let sigma = Math.sqrt(d / m)
        let avg = totalWin / this.SpinCount
        return `${(sigma / avg).toFixed(2)}`
    }
}
