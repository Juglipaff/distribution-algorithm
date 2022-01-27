
const investBlock = {}
let sumOfBlockDepositsMultiplied = 0
const stakes = {}
let totalDeposits = 0
let K = 0
let L = 0
const KForUser = {}
const LForUser = {}
let lastDistributionBlock = 0
let sumOfRewardsDivTotalDeposits = 0
let LK = 0

function deposit(user, amount, currentBlock) {
    let withdrawAmount=0
    if(stakes[user]!==undefined && stakes[user]>0){
        withdrawAmount = withdraw(user)
    }
    const depositAmount = amount + withdrawAmount
    investBlock[user] = currentBlock
    sumOfBlockDepositsMultiplied += depositAmount * currentBlock
    stakes[user] = depositAmount
    totalDeposits += depositAmount
    KForUser[user] = K
    LForUser[user] = L

    LK += depositAmount*(currentBlock*L - K)
}
function withdraw(user) {
    const amount = userBalance(user)
    sumOfBlockDepositsMultiplied -= investBlock[user] * stakes[user]
    totalDeposits -= stakes[user]
    stakes[user] = 0

    LK -= stakes[user]*(investBlock[user]*LForUser[user] - KForUser[user])
    return amount
}
function distribute(reward, distBlock) {
    const multiplier = reward / (distBlock * totalDeposits - sumOfBlockDepositsMultiplied)
    K += distBlock * multiplier
    L += multiplier
    lastDistributionBlock = distBlock
    sumOfRewardsDivTotalDeposits += reward / totalDeposits
}

function userReward(user) {
    return stakes[user] * (K - KForUser[user] - investBlock[user] * (L - LForUser[user]))
}

function userBalance(user) {
    return stakes[user]  + stakes[user] * (K - KForUser[user] - investBlock[user] * (L - LForUser[user]))
}

function getTotalDeposits() {
    return totalDeposits + totalDeposits*K + LK - L*sumOfBlockDepositsMultiplied
}

//============================================
/*
const userA = 'A'
const userB = 'B'
const userC = 'C'
const userD = 'D'

const reward1 = 2000
const reward2 = 3000

deposit(userA, 500, 20)
deposit(userB, 700, 40)
deposit(userC, 200, 45)
distribute(reward1, 50)

let rewardA = userReward(userA)
let rewardB = userReward(userB)
let rewardC = userReward(userC)
let rewardD = 0

console.log('Distribution 1')
console.log('userA reward: ' + rewardA)
console.log('userB reward: ' + rewardB)
console.log('userC reward: ' + rewardC)
console.log('Total reward: ' + (rewardA + rewardB + rewardC + rewardD) + ', Actual reward: ' + (reward1))
console.log('Total Deposit: ' + getTotalDeposits() + ', Actual Total Deposit: ' + (userBalance(userA) + userBalance(userB) + userBalance(userC)))

const w = withdraw(userC)
deposit(userC, w, 60)
deposit(userD, 1000, 80)
distribute(reward2, 100)

rewardA = userReward(userA)
rewardB = userReward(userB)
rewardC += userReward(userC) //we add rewardC because we withdrawn previous reward
rewardD = userReward(userD)

console.log('Distribution 2')
console.log('userA reward: ' + rewardA)
console.log('userB reward: ' + rewardB)
console.log('userC reward: ' + rewardC)
console.log('userD reward: ' + rewardD)

console.log('Total reward: ' + (rewardA + rewardB + rewardC + rewardD) + ', Actual reward: ' + (reward1 + reward2))
console.log('Total Deposits: ' + getTotalDeposits() + ', Actual Total Deposit: ' + (userBalance(userA) + userBalance(userB) + userBalance(userC) + userBalance(userD)))
*/
const userA = 'A'
const userB = 'B'
deposit(userA, 5000, 0)
deposit(userB, 5000, 0)
deposit(userA, 1, 49)
distribute(2000, 50)
console.log(userReward(userA), userReward(userB))