module.exports = class Contract {
    constructor() {
        this.userDeposit = {}
        this.totalDeposits = 0
        this.totalDepositLastUpdated = 0
        this.userDepositLastUpdated={}

        this.totalDepositAge = 0
        this.userDepositAge = {}
        this.userDepositChanged = {}

        this.rewards = {}
        this.cumulativeRewards = 0

        this.distributionID = 0
        this.distributionIDForUser = {}

        this.K = {}
        this.L = {}
        this.distributions = {}
    }

    _initJSVariables(user){
        if(this.userDepositChanged[user]===undefined){
            this.userDepositChanged[user] = {}
        }
        if(this.userDepositAge[user] === undefined){
            this.userDepositAge[user] = 0
            this.userDeposit[user] = 0
            this.distributionIDForUser[user] = 0
            this.userDepositLastUpdated[user] = 0
            this.rewards[user] = 0
        }
    }

    _updateDeposit(user, currentBlock) {
        this._initJSVariables(user)

        // accumulate deposit age within the current distribution interval
        if(this.userDepositChanged[user][this.distributionID]){
            // add deposit age from previous deposit update till now
            this.userDepositAge[user] += this.userDeposit[user] * (currentBlock - this.userDepositLastUpdated[user])
        }else{
            // a reward has been distributed, update user reward
            this.rewards[user] += this.userReward(user) 
            // count fresh deposit age from that reward distribution till now
            this.userDepositAge[user] = this.userDeposit[user] * (currentBlock - (this.distributions[this.distributionID - 1]||0))
            this.userDepositChanged[user][this.distributionID] = true
        }
        // same with total deposit age
        this.totalDepositAge += this.totalDeposits*(currentBlock - this.totalDepositLastUpdated)

        this.userDepositLastUpdated[user] = currentBlock
        this.totalDepositLastUpdated = currentBlock
        
        this.distributionIDForUser[user] = this.distributionID
    }

    deposit(user, amount, currentBlock) {
        this._updateDeposit(user, currentBlock)
        // update deposit amounts
        this.userDeposit[user] += amount
        this.totalDeposits += amount 
    }

    withdraw(user, amount, currentBlock) {
        this._updateDeposit(user, currentBlock)
        // update deposit amounts
        this.userDeposit[user] -= amount
        //if totalDeposits gets below 0 subtract leftover amount from cumulativeRewards
        if(amount > this.totalDeposits){
            const leftover = amount - this.totalDeposits
            this.totalDeposits = 0
            this.cumulativeRewards -= leftover
        } else {
            this.totalDeposits -= amount
        }
    }

    distribute(reward, currentBlock) {
        // reward per deposit age
        const _K = reward/(this.totalDepositAge + this.totalDeposits*(currentBlock - this.totalDepositLastUpdated))
        // write Ks to the mapping on each distribution.
        this.K[this.distributionID] = _K
        // write L sums to the mapping on each distribution. We use it to calculate the sum of Ls between the last distribution and the distribution that has happened after the last user deposit
        this.L[this.distributionID] = (this.L[this.distributionID - 1] || 0) + _K * (currentBlock - (this.distributions[this.distributionID - 1]||0))
        // write each distribution block to the mapping.
        this.distributions[this.distributionID] = currentBlock

        //update distribution id
        this.distributionID += 1

        this.totalDepositLastUpdated = currentBlock
        // cumulativeRewards provides us a way to get total deposits and to not get below 0 in totalDeposits calculations
        this.cumulativeRewards += reward
        //flush totalDepositAge
        this.totalDepositAge = 0
    }

    userReward(user) {
        this._initJSVariables(user)
        if(this.userDepositChanged[user][this.distributionID]){
            //return reward if the distribution after the last user deposit did not happen yet
            return this.rewards[user]
        }else{
            const _userDepositAge = this.userDepositAge[user] + this.userDeposit[user] * ((this.distributions[this.distributionIDForUser[user]]||0) - this.userDepositLastUpdated[user])
            //calculate reward between the last user deposit and the distribution after that
            const rewardsBeforeDistibution = _userDepositAge * (this.K[this.distributionIDForUser[user]]||0)
            //calculate reward after the distribution that has happened after the last user deposit
            const rewardsAfterDistribution = this.userDeposit[user] * ((this.L[this.distributionID - 1]||0) - (this.L[this.distributionIDForUser[user]]||0))
            return this.rewards[user] + rewardsBeforeDistibution + rewardsAfterDistribution
        }
    }

    userBalance(user) {
        this._initJSVariables(user)
        return this.userDeposit[user] + this.userReward(user)
    }

    getTotalDeposits() {
        return this.cumulativeRewards + this.totalDeposits
    }
}