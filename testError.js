const Contract = require('./contract.js');


const userAmount = 10
const users = Array.from(Array(userAmount).keys())

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

let userErrorData = users.map((user) => { 
    return [user, {maxError:0, errorSum:0}]
})
userErrorData = Object.fromEntries(userErrorData)


const MaxErrorData = {error:0}

const iterations = 100000
for (let i = 0; i < iterations; i++) {
    const contract = new Contract()

    let prevBlock = 0
    let userData = []
    for (let j = 0; j < users.length; j++) {
        const amount = getRandomInt(900719925474099) + 1 
        const block = prevBlock + getRandomInt(10000)
        prevBlock = block
        userData.push({user:users[j], amount, block})
    }
    const reward = getRandomInt(900719925474099) + 1
    const rewardBlock = prevBlock + getRandomInt(10000) 

    const userDepositAges = userData.map((user) => (rewardBlock - user.block)*user.amount) 
    const totalDepositAge = userDepositAges.reduce((previousValue, currentValue) => previousValue + currentValue,0)
    userData = userData.map((user, index) => ({
        ...user,
        theoreticalBalance: user.amount + reward*userDepositAges[index]/totalDepositAge
    })) 

    contract.setExpectedReward(reward, rewardBlock)
    userData.forEach((user) => contract.deposit(user.user, user.amount, user.block))
    contract.distribute(reward, rewardBlock)  

    userData = userData.map((user) => {
        const userBalance = contract.userBalance(user.user)
        return {
            ...user,
            practicalBalance: userBalance,
            error: Math.abs(user.theoreticalBalance - userBalance) / user.theoreticalBalance
        }
    }) 

    userData.forEach((user) => {
        userErrorData[user.user].errorSum += user.error
        if(user.error > userErrorData[user.user].maxError){
            userErrorData[user.user].maxError = user.error
        }
    }) 

    if(userData.some((user) => user.error > MaxErrorData.error)){
        MaxErrorData.error = Math.max(...userData.map(user => user.error))

        userData.forEach((user) => {
            MaxErrorData['amount' + user.user] = user.amount
        })
        MaxErrorData.reward = reward

        userData.forEach((user) => {
            MaxErrorData['block' + user.user] = user.block
        })
        MaxErrorData.rewardBlock = rewardBlock


        userData.forEach((user) => {
            MaxErrorData[user.user + 'Theoretical'] = user.theoreticalBalance
            MaxErrorData[user.user + 'Practical'] = user.practicalBalance
        })
    }
}

users.forEach(user=>{
    console.log(`Max user ${user} balance error: `, (userErrorData[user].maxError*100).toFixed(2)+'%')
})
console.log('\n')
users.forEach(user=>{
    console.log(`Average user ${user} balance error: `, (userErrorData[user].errorSum/iterations*100).toFixed(2)+'%')
})

console.log('\nMax error data:')

Object.keys(MaxErrorData).forEach((prop)=> {
    if(prop==='error'){
        console.log(prop + ':', (MaxErrorData[prop]*100).toFixed(2)+'%')
        return
    }
    console.log(prop + ':', MaxErrorData[prop])
})
