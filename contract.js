module.exports = class Contract {
    constructor() {
        this.totalDeposits = 0
        this.cumulativeBlockDeposits = 0
        this.expectedDistribution = 0
        this.expectedReward = 0 
        this.totalULP = 0
        this.ULP = {}
        this.stake = {}
        this.setExpectedReward(0, 100)
        this.lastDistribution = 0
        this.hasDeposited={}
    }

    setExpectedReward(amount, block){
        this.expectedReward = amount
        this.expectedDistribution = block
    }

    deposit(user, amount, currentBlock) {
        if(this.hasDeposited[user]===undefined){
            this.hasDeposited[user]={}
        }
        this.stake[user] = (this.stake[user]||0) + amount
        if(!this.hasDeposited[user][this.lastDistribution]){
            this.hasDeposited[user][this.lastDistribution] = true
            this.cumulativeBlockDeposits += this.stake[user]*(this.expectedDistribution - currentBlock)
        }else{
            this.cumulativeBlockDeposits += amount*(this.expectedDistribution - currentBlock)
        }
        this.totalDeposits += amount

        let newULP
        if(this.totalULP === 0){
            newULP = 1
        }else{
            const userBlockTime = (this.expectedDistribution - currentBlock) * amount / this.cumulativeBlockDeposits
            const x = (amount + this.expectedReward * userBlockTime) / (this.totalDeposits + this.expectedReward )
            newULP = x/(1 - x)*this.totalULP
        }
        this.ULP[user] = (this.ULP[user]||0) + newULP
        this.totalULP += newULP 
    }

    withdraw(user, amount, currentBlock) {
        this.stake[user] -= amount
        if(!this.hasDeposited[user][this.lastDistribution]){
            this.hasDeposited[user][this.lastDistribution] = true
            this.cumulativeBlockDeposits += this.stake[user]*(this.expectedDistribution - currentBlock)
        }else{
            this.cumulativeBlockDeposits -= amount*(this.expectedDistribution - currentBlock)
        }

        const withdrawnULP = amount * this.totalULP / this.totalDeposits
        this.totalDeposits -= amount
        this.totalULP -= withdrawnULP 
        this.ULP[user] -= withdrawnULP
    }

    distribute(reward, currentBlock) {
        this.totalDeposits += reward
        this.cumulativeBlockDeposits = 0
        this.lastDistribution = currentBlock
    }

    userBalance(user) {
        return this.totalDeposits * (this.ULP[user]||0) / this.totalULP
    }

    getTotalDeposits() {
        return this.totalDeposits
    }
}