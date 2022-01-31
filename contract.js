module.exports = class Contract {
    constructor() {
        this.sumOfBlockDepositsMultiplied = 0
        this.stakes = {}
        this.totalDeposits = 0
        this.K = 0
        this.L = 0
        this.KForUser = {}
        this.LForUser = {}
        this.LK = 0
        this.lastDistribution = 0
    
        this.sumOfBlockDepositsMultipliedForUser = {}
    }

    deposit(user, amount, currentBlock) {
        let withdrawAmount = 0
        if(this.stakes[user]!==undefined && this.stakes[user] > 0){
            withdrawAmount = this._withdraw(user)
        }
        this.sumOfBlockDepositsMultipliedForUser[user] = (this.sumOfBlockDepositsMultipliedForUser[user]||0) + amount * currentBlock
        const depositAmount = amount + withdrawAmount
        this._deposit(user, depositAmount)
    }
    withdraw(user, amount, currentBlock) {
        const stake = this.stakes[user]
        const withdrawAmount = this._withdraw(user)
        const depositAmount = withdrawAmount - amount

        if(depositAmount > 0) {
            this.sumOfBlockDepositsMultipliedForUser[user] -= amount * currentBlock
            this._deposit(user, depositAmount)
            return
        }
        this.sumOfBlockDepositsMultipliedForUser[user] -= amount * this.sumOfBlockDepositsMultipliedForUser[user]/stake + amount * currentBlock
    }
    _deposit(user, amount) {
        this.stakes[user] = amount
        this.totalDeposits += amount
        this.KForUser[user] = this.K
        this.LForUser[user] =  this.L

        this.sumOfBlockDepositsMultiplied += this.sumOfBlockDepositsMultipliedForUser[user] 
        this.LK += this.sumOfBlockDepositsMultipliedForUser[user]*this.L - this.K*this.stakes[user]
    }
    _withdraw(user) {
        const amount = this.userBalance(user)
        this.LK -= this.sumOfBlockDepositsMultipliedForUser[user]*this.LForUser[user] - this.KForUser[user]*this.stakes[user]
        this.sumOfBlockDepositsMultiplied -= this.sumOfBlockDepositsMultipliedForUser[user]
        this.totalDeposits -= this.stakes[user]
        this.stakes[user] = 0

        return amount
    }

    distribute(reward, distBlock) {
        const _K = reward*distBlock/(distBlock * this.totalDeposits - this.sumOfBlockDepositsMultiplied)
        this.K += _K
        this.L += _K/distBlock
    }

    userReward(user) {
        if(this.stakes[user] === 0){
            return 0
        }
        const weightedAverageBlock = this.sumOfBlockDepositsMultipliedForUser[user]/this.stakes[user]
        return this.stakes[user] *(this.K + weightedAverageBlock * this.LForUser[user] - this.KForUser[user] - weightedAverageBlock * this.L)
    }

    userBalance(user) {
        return this.stakes[user] + this.userReward(user)
    }

    getTotalDeposits() {
        return this.totalDeposits +this.totalDeposits*this.K + this.LK - this.L*this.sumOfBlockDepositsMultiplied
    }
}