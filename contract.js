module.exports = class Contract {
    constructor() {
        this.expectedRewardBlock = 0
        this.expectedReward = 0
        this.totalDeposits = 0
        this.userDeposits = {}
        this.userDALastUpdated = {}   // last block where user's deposit age was recalculated
        this.totalDALastUpdated = 0
        this.userDepositChanged = {}  // flag to be flushed on every reward distribution
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
        // init values
        if (this.userDeposits[user] === undefined) {
            this.userDeposits[user] = 0
        }
        if (this.userDALastUpdated[user] === undefined) {
            this.userDALastUpdated[user] = 0
        }
        // accumulate deposit age within the current distribution interval
        if (this.userDALastUpdated[user] > this.lastRewardBlock || this.userDepositChanged[user]) {
            // add deposit age from previous deposit age update till now
            this.userDepositAge[user] += (currentBlock - this.userDALastUpdated[user]) * this.userDeposits[user]
        } else {
            // a reward has been distributed, update user deposit
            this.userDeposits[user] = this.userBalance(user)
            // count fresh deposit age from that reward distribution till now
            this.userDepositAge[user] = (currentBlock - this.lastRewardBlock) * this.userDeposits[user]
        }
        // same with total deposit age
        if (this.totalDALastUpdated > this.lastRewardBlock) {
            this.totalDepositAge += (currentBlock - this.totalDALastUpdated) * this.totalDeposits
        } else {
            this.totalDepositAge = (currentBlock - this.lastRewardBlock) * this.totalDeposits
        }
        this.userDALastUpdated[user] = currentBlock
        this.totalDALastUpdated = currentBlock
    }

    deposit(user, amount, currentBlock) {
        this._updateDeposit(user, currentBlock)
        // note: user's actual fair reward may differ from these calculations because new deposits
        // in the same reward interval will change the total expected deposit age, so there's no way
        // to reliably & precisely predict the correct reward distribution, but this approach still
        // provides results good enough and remains practical

        let blocksTillReward = this.expectedRewardBlock - currentBlock
        // total deposit age we expected by the end of reward interval before this deposit
        let totalExpectedDepositAgePrev = this.totalDepositAge + this.totalDeposits * blocksTillReward
        // how much higher the deposit age is now expected to be by the end of reward interval
        let addedExpectedDepositAge = amount * blocksTillReward
        // new expected total deposit age
        let totalExpectedDepositAge = totalExpectedDepositAgePrev + addedExpectedDepositAge
        
        // update deposit amounts
        this.userDeposits[user] += amount
        this.totalDeposits += amount
        
        // expected reward will increase proportionally to the increase of total expected deposit age
        if (totalExpectedDepositAgePrev > 0) {
            this.expectedReward *= (totalExpectedDepositAgePrev + addedExpectedDepositAge) / totalExpectedDepositAgePrev
        }

        // mint ULP tokens
        let newULP
        if (this.totalULP == 0) {
            newULP = 1.0
        } else {
            // user's new expected deposit age by the end of the reward interval
            let userExpectedDepositAge = this.userDepositAge[user] + this.userDeposits[user] * blocksTillReward
            // reward the user is now expected to receive by the end of reward interval
            let userExpectedReward = this.expectedReward * userExpectedDepositAge / totalExpectedDepositAge
            // new estimated user's share of total deposit after the nearest reward
            let userNewShare = (this.userDeposits[user] + userExpectedReward) / (this.totalDeposits + this.expectedReward)
            // amount of ULP tokens to mint to represent the new user's share
            if (!this.ULP[user]) {
                // by solving the equation: userNewShare = newULP / (this.totalULP + newULP)
                newULP = this.totalULP * userNewShare / (1 - userNewShare)
            } else if (userNewShare == 1) {
                // by solving the equation: (this.totalULP + newULP) / this.totalULP = this.userDeposits[user] / (this.userDeposits[user] - amount)
                newULP = this.totalULP * (this.userDeposits[user] / (this.userDeposits[user] - amount) - 1)
            } else {
                // by solving the equation: userNewShare = (this.ULP[user] + newULP) / (this.totalULP + newULP)
                newULP = (userNewShare * this.totalULP - this.ULP[user]) / (1 - userNewShare)
            }
        }
        this.ULP[user] = (this.ULP[user]||0) + newULP
        this.totalULP += newULP
        this.userDepositChanged[user] = true
    }

    withdraw(user, amount, currentBlock) {
        if (this.userBalance(user) < amount) {
            return console.error('Not enough balance: user '+user+' has '+this.userBalance(user)+' but tried to withdraw '+amount)
        }
        this._updateDeposit(user, currentBlock)

        let blocksTillReward = this.expectedRewardBlock - currentBlock
        // total deposit age we expected by the end of reward interval before this withdrawal
        let totalExpectedDepositAgePrev = this.totalDepositAge + this.totalDeposits * blocksTillReward
        // how much lower the deposit age is now expected to be by the end of reward interval
        let removedExpectedDepositAge = amount * blocksTillReward
        // new expected total deposit age
        let totalExpectedDepositAge = totalExpectedDepositAgePrev - removedExpectedDepositAge
        
        // update deposit amounts
        this.userDeposits[user] -= amount
        this.totalDeposits -= amount
        // expected reward will decrease proportionally to the decrease of total expected deposit age
        this.expectedReward *= (totalExpectedDepositAgePrev - removedExpectedDepositAge) / totalExpectedDepositAgePrev

        // user's new expected deposit age by the end of the reward interval
        let userExpectedDepositAge = this.userDepositAge[user] + this.userDeposits[user] * blocksTillReward
        // reward the user is now expected to receive by the end of reward interval
        let userExpectedReward = this.expectedReward * userExpectedDepositAge / totalExpectedDepositAge
        // new estimated user's share of total deposit after the nearest reward
        let userNewShare = (this.userDeposits[user] + userExpectedReward) / (this.totalDeposits + this.expectedReward)
        // user's old share of total, based on their ULP tokens
        let userOldShare = this.ULP[user] / this.totalULP

        // burn ULP tokens to reduce user's share to the new value
        let burntULP
        if (userOldShare == 1) {
            // if the user is the only depositor in the pool, just reduce their ULP tokens proportionally
            burntULP = this.totalULP * amount / (this.userDeposits[user] + amount)
        } else {
            // leave user's fair share of ULP and burn the rest
            // by solving the equation: userNewShare = (this.ULP[user] - burntULP) / (this.totalULP - burntULP)
            burntULP = (this.ULP[user] - userNewShare * this.totalULP)/(1 - userNewShare)
        }
        this.totalULP -= burntULP
        this.ULP[user] -= burntULP
        this.userDepositChanged[user] = true
    }

    distribute(reward, currentBlock) {
        this.totalDeposits += reward
        
        // This is a non-O(1) operation, but it's only needed to handle deposits that happen in one block
        // with a reward distribution to determine their sequence. This flag can be completely removed if
        // we don't allow deposits/withdrawals in one block with distributions.
        this.userDepositChanged = {}
        
        // to avoid having negative expected reward time we set expected reward block right here based on the previous reward time
        let lastRewardPeriod = currentBlock - this.lastRewardBlock
        this.setExpectedReward(reward, currentBlock + lastRewardPeriod)
        this.lastRewardBlock = currentBlock
    }

    userBalance(user) {
        if (this.userDALastUpdated[user] > this.lastRewardBlock || this.userDepositChanged[user]) {
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