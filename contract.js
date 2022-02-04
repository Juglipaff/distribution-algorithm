module.exports = class Contract {
    constructor() {
        this.stakes = {}
        this.totalDeposits = 0
        this.previosDeposit = 0
        this.previosDepositForUser={}


        this.K = 0
        this.L = 0

        this.lastDistBlock = 0

        this.lastDistBlockForUser = {}

        this.cumulativeBlockDepositsMultiplied = 0
        this.CBD = {}
        this.nextDistBlock={}
        this.appliedSum= {}

        this.KForUser = {}
        this.Ks = {}

        this.reward = {}
        this.Ls = {}
        this.totalReward = 0
    }

    deposit(user, amount, currentBlock) {
        if(this.appliedSum[user]===undefined){
            this.appliedSum[user]={}
        }
        if(!this.appliedSum[user][this.lastDistBlock]){
            this.appliedSum[user][this.lastDistBlock] = true
            this.reward[user] = (this.reward[user]||0) + this.userReward(user)

            this.CBD[user] = 0
        }

        this.cumulativeBlockDepositsMultiplied += this.totalDeposits*(currentBlock - this.previosDeposit) 

        const lastUserBlock = ((this.previosDepositForUser[user]||0) < this.lastDistBlock) ? this.lastDistBlock : (this.previosDepositForUser[user]||0)
        this.CBD[user] = (this.CBD[user]||0) + (this.stakes[user]||0)*(currentBlock - lastUserBlock)

        this.stakes[user] = (this.stakes[user]||0) + amount
        this.totalDeposits += amount

        this.previosDepositForUser[user] = currentBlock
        this.previosDeposit = currentBlock

        this.lastDistBlockForUser[user] = this.lastDistBlock 
        this.KForUser[user] = this.K 
    }

    withdraw(user, amount, currentBlock) {
        if(!this.appliedSum[user][this.lastDistBlock]){
            this.appliedSum[user][this.lastDistBlock] = true
            this.reward[user] += this.userReward(user) 
            
            this.CBD[user] = 0
        }
       
        this.cumulativeBlockDepositsMultiplied += this.totalDeposits*(currentBlock - this.previosDeposit)
        
        const lastUserBlock = (this.previosDepositForUser[user] < this.lastDistBlock) ? this.lastDistBlock : this.previosDepositForUser[user]
        this.CBD[user] += this.stakes[user]*(currentBlock - lastUserBlock)

        this.totalDeposits -= amount
        this.stakes[user] -= amount

        this.previosDepositForUser[user] = currentBlock
        this.previosDeposit = currentBlock

        this.lastDistBlockForUser[user] = this.lastDistBlock 
        this.KForUser[user] = this.K 
    }

    distribute(reward, distBlock,log) {
        const _K = reward/(this.cumulativeBlockDepositsMultiplied + this.totalDeposits*(distBlock - this.previosDeposit))
        this.K += reward/(this.cumulativeBlockDepositsMultiplied + this.totalDeposits*(distBlock - this.previosDeposit))
        this.L += _K * (distBlock - this.lastDistBlock)

        this.nextDistBlock[this.lastDistBlock] = distBlock
        
        this.Ks[this.lastDistBlock] = this.K
        this.Ls[this.lastDistBlock] = this.L

        this.lastDistBlock = distBlock
        this.cumulativeBlockDepositsMultiplied = 0
        this.previosDeposit = distBlock

        this.totalReward += reward
    }

    userReward(user,log) {
        let nextDistBlock
        if(this.lastDistBlockForUser[user]===undefined){
            nextDistBlock = this.lastDistBlock
        }else{
            nextDistBlock = this.nextDistBlock[this.lastDistBlockForUser[user]] || this.lastDistBlock
        }
        const CBD = (this.CBD[user]||0) + (this.stakes[user]||0) * (nextDistBlock - (this.previosDepositForUser[user]||0))
        //can be negative i think, use const lastUserBlock = (this.previosDepositForUser[user] < this.lastDistBlock) ? this.lastDistBlock : this.previosDepositForUser[user]
        const Luser =  this.Ls[this.lastDistBlockForUser[user]]===undefined ? this.L : this.Ls[this.lastDistBlockForUser[user]]
        const CBD2 = (this.stakes[user]||0) * (this.L - Luser) 

        return (this.reward[user]||0) + ((this.Ks[this.lastDistBlockForUser[user]]||this.K) - this.KForUser[user]||0) * CBD + CBD2
    }

    userBalance(user,log) {
        return this.stakes[user] + this.userReward(user,log)
    }

    getTotalDeposits() {
        return this.totalReward + this.totalDeposits
    }
}