module.exports = class Contract {
    constructor() {
        this.stakes = {}
        this.totalDeposits = 0
        this.previosDeposit = 0
        this.previosDepositForUser={}
        this.K = 0
        this.L = 0
        this.lastDistribution = 0
        this.lastDistributionForUser = {}
        this.cumulativeBlockDeposits = 0
        this.cumulativeBlockDepositsForUser = {}
        this.nextDistribution={}
        this.hasDeposited= {}

        this.KForUser = {}
        this.KOnBlock = {}

        this.rewards = {}
        this.LOnBlock = {}
        this.cumulativeRewards = 0
    }

    deposit(user, amount, currentBlock) {
        if(this.hasDeposited[user]===undefined){
            this.hasDeposited[user]={}
        }
        if(!this.hasDeposited[user][this.lastDistribution]){
            this.hasDeposited[user][this.lastDistribution] = true
            this.rewards[user] = (this.rewards[user]||0) + this.userReward(user)

            this.cumulativeBlockDepositsForUser[user] = 0
        }

        this.cumulativeBlockDeposits += this.totalDeposits*(currentBlock - this.previosDeposit) 

        const previousDepositBlock = ((this.previosDepositForUser[user]||0) < this.lastDistribution) ? this.lastDistribution : (this.previosDepositForUser[user]||0)
        this.cumulativeBlockDepositsForUser[user] = (this.cumulativeBlockDepositsForUser[user]||0) + (this.stakes[user]||0)*(currentBlock - previousDepositBlock)

        this.stakes[user] = (this.stakes[user]||0) + amount
        this.totalDeposits += amount

        this.previosDepositForUser[user] = currentBlock
        this.previosDeposit = currentBlock

        this.lastDistributionForUser[user] = this.lastDistribution 
        this.KForUser[user] = this.K 
    }

    withdraw(user, amount, currentBlock) {
        if(!this.hasDeposited[user][this.lastDistribution]){
            this.hasDeposited[user][this.lastDistribution] = true
            this.rewards[user] += this.userReward(user) 
            
            this.cumulativeBlockDepositsForUser[user] = 0
        }
       
        this.cumulativeBlockDeposits += this.totalDeposits*(currentBlock - this.previosDeposit)
        
        const previosDepositBlock = (this.previosDepositForUser[user] < this.lastDistribution) ? this.lastDistribution : this.previosDepositForUser[user]
        this.cumulativeBlockDepositsForUser[user] += this.stakes[user]*(currentBlock - previosDepositBlock)

        this.totalDeposits -= amount
        this.stakes[user] -= amount

        this.previosDepositForUser[user] = currentBlock
        this.previosDeposit = currentBlock

        this.lastDistributionForUser[user] = this.lastDistribution 
        this.KForUser[user] = this.K 
    }

    distribute(reward, currentBlock) {
        const _K = reward/(this.cumulativeBlockDeposits + this.totalDeposits*(currentBlock - this.previosDeposit))
        this.K += _K
        this.L += _K * (currentBlock - this.lastDistribution)

        this.nextDistribution[this.lastDistribution] = currentBlock
        this.KOnBlock[this.lastDistribution] = this.K
        this.LOnBlock[this.lastDistribution] = this.L

        this.lastDistribution = currentBlock
        this.previosDeposit = currentBlock
        this.cumulativeRewards += reward
        this.cumulativeBlockDeposits = 0
    }

    userReward(user) {
        let nextDistributionForUser
        if(this.lastDistributionForUser[user]===undefined || !this.nextDistribution[this.lastDistributionForUser[user]]){//not sure how to handle undefined in solidity since mappings have 0 as their default value
            nextDistributionForUser = this.lastDistribution
        }else{
            nextDistributionForUser = this.nextDistribution[this.lastDistributionForUser[user]]
        }

        const _previosDepositForUser = (this.previosDepositForUser[user]||0) > nextDistributionForUser ? nextDistributionForUser : (this.previosDepositForUser[user]||0)
        const _cumulativeBlockDepositsForUser = (this.cumulativeBlockDepositsForUser[user]||0) + (this.stakes[user]||0) * (nextDistributionForUser - _previosDepositForUser)
        const nextK = this.KOnBlock[this.lastDistributionForUser[user]] === undefined ? this.K : this.KOnBlock[this.lastDistributionForUser[user]]//not sure how to handle undefined in solidity since mappings have 0 as their default value
        const deltaK = nextK - (this.KForUser[user]||0)
        const rewardsBeforeDistibution = _cumulativeBlockDepositsForUser * deltaK
        
        const nextL = this.LOnBlock[this.lastDistributionForUser[user]] === undefined ? this.L : this.LOnBlock[this.lastDistributionForUser[user]]//not sure how to handle undefined in solidity since mappings have 0 as their default value
        const deltaLForUser = this.L - nextL
        const rewardsAfterDistribution = (this.stakes[user]||0) * deltaLForUser

        return (this.rewards[user]||0) + rewardsBeforeDistibution + rewardsAfterDistribution
    }

    userBalance(user,log) {
        return this.stakes[user] + this.userReward(user,log)
    }

    getTotalDeposits() {
        return this.cumulativeRewards + this.totalDeposits
    }
}