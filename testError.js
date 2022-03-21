const Contract = require('./contract.js');

const userA = 'A'
const userB = 'B'
const userC = 'C'

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
let AMaxError = 0
let BMaxError = 0
let CMaxError = 0

const MaxErrorData = {error:0}

for (let i = 0; i < 10000000; i++) {
    const contract = new Contract()

    const amount1 = getRandomInt(1000) + 1
    const amount2 = getRandomInt(1000) + 1
    const amount3 = getRandomInt(1000) + 1
    const reward = getRandomInt(1000) + 1

    const block1 = getRandomInt(100)
    const block2 = block1 + getRandomInt(100)
    const block3 = block2 + getRandomInt(100)
    const rewardBlock = block3 + getRandomInt(100)

    /*const amount1 = 500
    const amount2 = 700
    const amount3 = 200
    const reward = 2000

    const block1 = 20
    const block2 = 40
    const block3 = 45
    const rewardBlock = 50*/

    //get theoretical user balance after distribution
    const userADepositAge = (rewardBlock - block1)*amount1
    const userBDepositAge = (rewardBlock - block2)*amount2 
    const userCDepositAge = (rewardBlock - block3)*amount3
    const totalDepositAge = userADepositAge + userBDepositAge + userCDepositAge

    const ATheoretical = amount1 + reward*userADepositAge/totalDepositAge
    const BTheoretical = amount2 + reward*userBDepositAge/totalDepositAge
    const CTheoretical = amount3 + reward*userCDepositAge/totalDepositAge

    //get actual user balance after distribution
    contract.setExpectedReward(reward, rewardBlock)
    contract.deposit(userA, amount1, block1)
    contract.deposit(userB, amount2, block2)
    contract.deposit(userC, amount3, block3)
    contract.distribute(reward, rewardBlock)    
    
    const APractical = contract.userBalance(userA)
    const BPractical = contract.userBalance(userB)
    const CPractical = contract.userBalance(userC)

    const AError = Math.abs(ATheoretical - APractical) / ATheoretical
    const BError = Math.abs(BTheoretical - BPractical) / BTheoretical
    const CError = Math.abs(CTheoretical - CPractical) / CTheoretical

    if(AError > AMaxError){
        AMaxError = AError
    }
    if(BError > BMaxError){
        BMaxError = BError
    }
    if(CError > CMaxError){
        CMaxError = CError
    }

    if(AError > MaxErrorData.error || BError > MaxErrorData.error || CError > MaxErrorData.error){
        MaxErrorData.error = Math.max(AError, BError, CError)

        MaxErrorData.amount1 = amount1
        MaxErrorData.amount2 = amount2
        MaxErrorData.amount3 = amount3
        MaxErrorData.reward = reward
        
        MaxErrorData.block1 = block1
        MaxErrorData.block2 = block2
        MaxErrorData.block3 = block3
        MaxErrorData.rewardBlock = rewardBlock

        MaxErrorData.ATheoretical = ATheoretical
        MaxErrorData.APractical = APractical

        MaxErrorData.BTheoretical = BTheoretical
        MaxErrorData.BPractical = BPractical

        MaxErrorData.CTheoretical = CTheoretical
        MaxErrorData.CPractical = CPractical
    }
}
console.log('Max user A balance error: ', (AMaxError*100).toFixed(2)+'%')
console.log('Max user B balance error: ', (BMaxError*100).toFixed(2)+'%')
console.log('Max user C balance error: ', (CMaxError*100).toFixed(2)+'%')
console.log('\nMax error data:')

Object.keys(MaxErrorData).forEach((prop)=> {
    if(prop==='error'){
        console.log(prop + ':', (MaxErrorData[prop]*100).toFixed(2)+'%')
        return
    }
    console.log(prop + ':', MaxErrorData[prop])
}
)
//console.log('Max error data: ', MaxErrorData)