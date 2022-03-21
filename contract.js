module.exports = class Contract {
    constructor() {
        this.expectedRewardBlock = 0
        this.expectedReward = 0
        this.totalDeposits = 0
        this.userDeposits = {}
        this.userDALastUpdated = {}   // last block where user's deposit age was recalculated
        this.totalDALastUpdated = 0
        this.userDepositChanged = {}
        this.userDepositAge = {}
        this.totalDepositAge = 0
        this.totalULP = 0
        this.ULP = {}
        this.lastRewardBlock = 0
        this.setExpectedReward(0, 100)
    }

    setExpectedReward(amount, block){
        this.expectedReward = amount
        this.expectedRewardBlock = block
    }

    _updateDeposit(user, currentBlock) {
        // init values  //js only 
        if (this.userDeposits[user] === undefined) {
            this.userDeposits[user] = 0
        }
        if (this.userDALastUpdated[user] === undefined) {
            this.userDALastUpdated[user] = 0
        }
        if (this.userDepositChanged[user] === undefined) {
            this.userDepositChanged[user] = {}
        }
        // accumulate deposit age within the current distribution interval
        const userDepositChanged = this.userDepositChanged[user][this.lastRewardBlock] || false
        if (userDepositChanged) {
            // add deposit age from previous deposit age update till now
            this.userDepositAge[user] += (currentBlock - this.userDALastUpdated[user]) * this.userDeposits[user]
        } else {
            this.userDepositChanged[user][this.lastRewardBlock] = true
            // a reward has been distributed, update user deposit
            this.userDeposits[user] = this.userBalance(user)
            // count fresh deposit age from that reward distribution till now
            this.userDepositAge[user] = (currentBlock - this.lastRewardBlock) * this.userDeposits[user]
        }
        // same with total deposit age
        this.totalDepositAge += (currentBlock - this.totalDALastUpdated) * this.totalDeposits

        this.userDALastUpdated[user] = currentBlock
        this.totalDALastUpdated = currentBlock
    }

    deposit(user, amount, currentBlock) {
        this._updateDeposit(user, currentBlock)
        // update deposit amounts
        this.userDeposits[user] += amount
        this.totalDeposits += amount
        // calculate newly added expected deposit age to get user's added share
        let addedExpectedDepositAge = amount * (this.expectedRewardBlock - currentBlock)
        let totalExpectedDepositAge = this.totalDepositAge + this.totalDeposits * (this.expectedRewardBlock - currentBlock)
        // TODO: their actual reward will differ because deposits after him will change total expected deposit age!
        let userAddedExpectedReward = (addedExpectedDepositAge / totalExpectedDepositAge) * this.expectedReward
        let userAddedShare = (amount + userAddedExpectedReward) / (this.totalDeposits + this.expectedReward)
        // mint ULP tokens to represent the added share
        let newULP
        if (this.totalULP == 0) {
            newULP = 1.0
        } else {
            newULP = this.totalULP * userAddedShare / (1 - userAddedShare)
        }
        this.ULP[user] = (this.ULP[user]||0) + newULP
        this.totalULP += newULP
    }

    withdraw(user, amount, currentBlock) {
        if (this.userBalance(user) < amount) {
            return console.error('Not enough balance: user ' + user + ' has ' + this.userBalance(user) + ' but tried to withdraw ' + amount)
        }
        this._updateDeposit(user, currentBlock)
        // update deposit amounts
        this.userDeposits[user] -= amount
        this.totalDeposits -= amount
        // count deposit age already provided by the user in the current distribution interval
        let userExpectedDepositAge = this.userDepositAge[user] + this.userDeposits[user] * (this.expectedRewardBlock - currentBlock)
        let totalExpectedDepositAge = this.totalDepositAge + this.totalDeposits * (this.expectedRewardBlock - currentBlock)
        // calculate user's fair share of total when the next reward arrives
        let userExpectedReward = (userExpectedDepositAge / totalExpectedDepositAge) * this.expectedReward
        let userShare = (this.userDeposits[user] + userExpectedReward) / (this.totalDeposits + this.expectedReward)
        let burntULP
        if (userShare == 1) {
            // if the user is the only depositor in the pool, just reduce his ULP tokens proportionally
            burntULP = this.totalULP * amount / (this.userDeposits[user] + amount)
        } else {
            // leave user's fair share of ULP and burn the rest
            burntULP = (this.ULP[user] - userShare * this.totalULP)/(1 - userShare)
        }
        this.totalULP -= burntULP
        this.ULP[user] -= burntULP
    }

    distribute(reward, currentBlock) {
        this.totalDeposits += reward
        
        // to avoid having negative expected reward time we set expected reward block right here based on the previous reward time
        let lastRewardPeriod = currentBlock - this.lastRewardBlock
        this.setExpectedReward(reward, currentBlock + lastRewardPeriod)
        this.lastRewardBlock = currentBlock

        this.totalDepositAge = 0
        this.totalDALastUpdated = currentBlock
    }

    userBalance(user) {
        //js only 
        if(this.userDepositChanged[user] === undefined){
            this.userDepositChanged[user] = {}
        }
        //js only 

        const userDepositChanged = this.userDepositChanged[user][this.lastRewardBlock] || false
        if (userDepositChanged) {
            return this.userDeposits[user] || 0
        } else {
            if (this.totalULP == 0) {
                return 0;
            }
            return this.totalDeposits * (this.ULP[user]||0) / this.totalULP
        }
    }

    getTotalDeposits() {
        return this.totalDeposits
    }
}