module.exports = class Contract {
    constructor() {
        this.sumOfBlockDepositsMultiplied = 0
        this.stakes = {}
        this.totalDeposits = 0
        this.K = 0
        this.L = 0
        //this.LK = 0


        this.prevDistributionBlock = 0
        this.prevPrevDistributionBlock = 0
        this.totalDepositsInterval = 0

        this.investBlock = {}
        this.userLastDepositBlock = {}

        this.LL ={}
    
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
        this.userLastDepositBlock[user] = this.prevDistributionBlock
        this.totalDepositsInterval += amount
       // this.investBlock[user] = currentBlock
        this.stakes[user] = amount
        this.totalDeposits += amount
        this.sumOfBlockDepositsMultiplied += this.sumOfBlockDepositsMultipliedForUser[user] //amount*currentBlock
       

        //this.sumOfBlockDepositsMultiplied += this.sumOfBlockDepositsMultipliedForUser[user] 
        //this.LK += this.sumOfBlockDepositsMultipliedForUser[user]*this.L - this.K*this.stakes[user]
    }
    _withdraw(user) {
        this.totalDepositsInterval -= this.stakes[user]
        const amount = this.userBalance(user)
       // this.sumOfBlockDepositsMultiplied -= this.stakes[user] * this.investBlock[user]
        //this.LK -= this.sumOfBlockDepositsMultipliedForUser[user]*this.LForUser[user] - this.KForUser[user]*this.stakes[user]
        this.sumOfBlockDepositsMultiplied -= this.sumOfBlockDepositsMultipliedForUser[user]
        this.totalDeposits -= this.stakes[user]
        this.stakes[user] = 0
      //  this.investBlock[user] = 0

        return amount
    }

    distribute(reward, distBlock) {
        const div = this.totalDeposits*(distBlock - this.prevDistributionBlock) + this.totalDepositsInterval* this.prevDistributionBlock - this.sumOfBlockDepositsMultiplied

        const _K = reward*distBlock/div//(distBlock * this.totalDeposits - sumOfBlockDepositsMultipliedAdjusted)
        this.K += _K
        this.L += _K/distBlock


        this.prevPrevDistributionBlock = this.prevDistributionBlock 
        this.prevDistributionBlock = distBlock


        this.totalDepositsInterval = 0
        this.sumOfBlockDepositsMultiplied = 0

        this.LL[this.prevPrevDistributionBlock] = _K/distBlock
    }

    userReward(user) {
        const userLL = this.LL[this.userLastDepositBlock[user]]||0
        const investBlock = this.sumOfBlockDepositsMultipliedForUser[user]/this.stakes[user]
        return this.stakes[user]*(this.K- this.prevPrevDistributionBlock*(this.L - userLL) - investBlock * userLL)

    }

    userBalance(user) {
        return this.stakes[user] + this.userReward(user)
    }
    userStake(user) {
        return this.stakes[user]
    }

    getTotalDeposits() {
        return this.totalDeposits +this.totalDeposits*this.K + this.LK - this.L*this.sumOfBlockDepositsMultiplied
    }
}