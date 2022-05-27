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

        if(this.userDepositChanged[user][this.distributionID]){
            this.userDepositAge[user] += this.userDeposit[user]*(currentBlock - this.userDepositLastUpdated[user])
        }else{
            this.rewards[user] += this.userReward(user) 
            this.userDepositAge[user] = this.userDeposit[user]*(currentBlock - (this.distributions[this.distributionID - 1]||0))
            this.userDepositChanged[user][this.distributionID] = true
        }

        this.totalDepositAge += this.totalDeposits*(currentBlock - this.totalDepositLastUpdated)

        this.userDepositLastUpdated[user] = currentBlock
        this.totalDepositLastUpdated = currentBlock
        
        this.distributionIDForUser[user] = this.distributionID
    }

    deposit(user, amount, currentBlock) {
        this._updateDeposit(user, currentBlock)

        this.userDeposit[user] += amount
        this.totalDeposits += amount
    }

    withdraw(user, amount, currentBlock) {
        this._updateDeposit(user, currentBlock)

        this.userDeposit[user] -= amount
        this.totalDeposits -= amount
    }

    distribute(reward, currentBlock) {
        const _K = reward/(this.totalDepositAge + this.totalDeposits*(currentBlock - this.totalDepositLastUpdated))

        this.K[this.distributionID] = (this.K[this.distributionID - 1] || 0) + _K
        this.L[this.distributionID] = (this.L[this.distributionID - 1] || 0) + _K * (currentBlock - (this.distributions[this.distributionID - 1]||0))
        this.distributions[this.distributionID] = currentBlock

        this.distributionID += 1

        this.totalDepositLastUpdated = currentBlock
        this.cumulativeRewards += reward
        this.totalDepositAge = 0
    }

    userReward(user) {
        this._initJSVariables(user)
        if(this.distributionIDForUser[user] == this.distributionID){
            return this.rewards[user]
        }else{
            const _userDepositAge = this.userDepositAge[user] + this.userDeposit[user] * ((this.distributions[this.distributionIDForUser[user]]||0) - this.userDepositLastUpdated[user])
            const rewardsBeforeDistibution = _userDepositAge * ((this.K[this.distributionIDForUser[user]]||0) - (this.K[this.distributionIDForUser[user] - 1]||0))
            const rewardsAfterDistribution = this.userDeposit[user] * ((this.L[this.distributionID - 1]||0) - (this.L[this.distributionIDForUser[user]]||0))
            return this.rewards[user] + rewardsBeforeDistibution + rewardsAfterDistribution
        }
    }

    userBalance(user,log) {
        return this.userDeposit[user] + this.userReward(user,log)
    }

    getTotalDeposits() {
        return this.cumulativeRewards + this.totalDeposits
    }
}