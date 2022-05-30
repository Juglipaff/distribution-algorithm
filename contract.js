module.exports = class Contract {
    constructor() {
        this.totalDeposits = 0
        this.totalDepositLastUpdated = 0
        this.totalDepositAge = 0

        this.cumulativeReward = 0

        this.distributionID = 1

        this.distributionData = {}
        this.userData = {}
    }

    _initJSVariables(address){
        if(this.userData[address] === undefined){
            this.userData[address] = {}
            this.userData[address].depositAge = 0
            this.userData[address].deposit = 0
            this.userData[address].lastDistribution = 0
            this.userData[address].depositLastUpdated = 0
            this.userData[address].reward = 0
        }
    }

    _updateDeposit(address, currentBlock) {
        this._initJSVariables(address)

        /*storage*/const user = this.userData[address]
        // accumulate deposit age within the current distribution interval
        if(user.lastDistribution === this.distributionID){
            // add deposit age from previous deposit update till now
            user.depositAge += user.deposit * (currentBlock - user.depositLastUpdated)
        }else{
            // a reward has been distributed, update user reward
            user.reward = this.userReward(address) 
            // count fresh deposit age from that reward distribution till now
            user.depositAge = user.deposit * (currentBlock - (this.distributionData[this.distributionID - 1]?.block||0))
        }
        // same with total deposit age
        this.totalDepositAge += this.totalDeposits*(currentBlock - this.totalDepositLastUpdated)

        user.depositLastUpdated = currentBlock
        this.totalDepositLastUpdated = currentBlock
        
        user.lastDistribution = this.distributionID

        //redundant in solidity
        this.userData[address] = user
    }

    deposit(address, amount, currentBlock) {
        this._updateDeposit(address, currentBlock)
        // update deposit amounts
        this.userData[address].deposit += amount
        this.totalDeposits += amount 
    }

    withdraw(address, amount, currentBlock) {
        this._updateDeposit(address, currentBlock)
        /*storage*/const user = this.userData[address]
        // Subtract amount from user.reward first, then subtract remainder from user.deposit.
        if(amount > user.reward){
            user.deposit = user.deposit + user.reward - amount
            this.totalDeposits =  this.totalDeposits + user.reward - amount

            this.cumulativeReward -= user.reward
            user.reward = 0;
        } else {
            user.reward -= amount
            this.cumulativeReward -= amount
        }

        //redundant in solidity
        this.userData[address] = user
    }

    distribute(reward, currentBlock) {
        const _rewardPerTotalDepositAge = reward/(this.totalDepositAge + this.totalDeposits*(currentBlock - this.totalDepositLastUpdated))
        // on each distribution we write rewardPerTotalDepositAge, cumulativeRewardAgePerTotalDepositAge and distribution block to the mapping
        this.distributionData[this.distributionID] = {
            rewardPerTotalDepositAge: _rewardPerTotalDepositAge,
            cumulativeRewardAgePerTotalDepositAge : (this.distributionData[this.distributionID - 1]?.cumulativeRewardAgePerTotalDepositAge||0) +  _rewardPerTotalDepositAge * (currentBlock - (this.distributionData[this.distributionID - 1]?.block||0)),
            block:currentBlock
        }

        //update distribution id
        this.distributionID += 1

        this.totalDepositLastUpdated = currentBlock
        // cumulativeReward provides us a way to get total deposits and to not get below 0 in totalDeposits withdrawal calculations
        this.cumulativeReward += reward
        //flush totalDepositAge
        this.totalDepositAge = 0
    }

    userReward(address) {
        this._initJSVariables(address)
        /*storage*/const user = this.userData[address]
        if(user.lastDistribution === this.distributionID){
            //return reward if the distribution after the last user deposit did not happen yet
            return user.reward
        }
        const userDistributionData = this.distributionData[user.lastDistribution]
        const _userDepositAge = user.depositAge + user.deposit * ((userDistributionData?.block||0) - user.depositLastUpdated)
        //calculate reward between the last user deposit and the distribution after that
        const rewardBeforeDistibution = _userDepositAge * (userDistributionData?.rewardPerTotalDepositAge||0)
        //calculate reward after the distribution that has happened after the last user deposit
        const rewardAfterDistribution = user.deposit * ((this.distributionData[this.distributionID - 1]?.cumulativeRewardAgePerTotalDepositAge||0) - (userDistributionData?.cumulativeRewardAgePerTotalDepositAge||0))
        return user.reward + rewardBeforeDistibution + rewardAfterDistribution
    }

    userBalance(address) {
        this._initJSVariables(address)
        return this.userData[address].deposit + this.userReward(address)
    }

    getTotalDeposits() {
        return this.cumulativeReward + this.totalDeposits
    }
}