const Contract = require('./contract.js');

const userA = 'A'
const userB = 'B'
const userC = 'C'
const userD = 'D'
let contract
beforeEach(() => {contract = new Contract()})

describe('deposits', () => {
    test('deposits tokens for one user', () => {
        const amount = 1000
        contract.deposit(userA, amount, 0)
        expect(contract.userBalance(userA)).toBeCloseTo(amount, 8)
    })

    test('deposits tokens for multiple users', () => {
        const amount1 = 500
        const amount2 = 1000
        const amount3 = 1200
        contract.deposit(userA, amount1, 0)
        contract.deposit(userB, amount2, 0)
        contract.deposit(userC, amount3, 0)

        expect(contract.userBalance(userA)).toBeCloseTo(amount1, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2, 8)
        expect(contract.userBalance(userC)).toBeCloseTo(amount3, 8)
    })

    test('deposits add up', () => {
        const amount1 = 500
        const amount2 = 1000
        const amount3 = 1200

        const amount4 = 600
        const amount5 = 2000
        const amount6 = 3200

        contract.deposit(userA, amount1, 0)
        contract.deposit(userB, amount2, 0)
        contract.deposit(userC, amount3, 0)

        contract.deposit(userA, amount4, 0)
        contract.deposit(userB, amount5, 0)
        contract.deposit(userC, amount6, 0)

        expect(contract.userBalance(userA)).toBeCloseTo(amount1+amount4, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2+amount5, 8)
        expect(contract.userBalance(userC)).toBeCloseTo(amount3+amount6, 8)
    })
})

describe('withdraws', () => {
    test('withdraws tokens for one user', () => {
        const amount1 = 500
        const withdraw_amount1 = 300
        contract.deposit(userA, amount1, 0)
        contract.withdraw(userA, withdraw_amount1, 0)
        expect(contract.userBalance(userA)).toBeCloseTo(amount1 - withdraw_amount1, 8)
    })

    test('withdraws tokens for multiple users', () => {
        const amount1 = 500
        const amount2 = 1000
        const amount3 = 1200

        const withdraw_amount1 = 300
        const withdraw_amount2 = 700
        const withdraw_amount3 = 900
        contract.deposit(userA, amount1, 0)
        contract.deposit(userB, amount2, 0)
        contract.deposit(userC, amount3, 0)

        contract.withdraw(userA, withdraw_amount1, 0)
        contract.withdraw(userB, withdraw_amount2, 0)
        contract.withdraw(userC, withdraw_amount3, 0)

        expect(contract.userBalance(userA)).toBeCloseTo(amount1 - withdraw_amount1, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 - withdraw_amount2, 8)
        expect(contract.userBalance(userC)).toBeCloseTo(amount3 - withdraw_amount3, 8)
    })
})

describe('distributes', () => {
    test('distributes tokens equaly if invested on the same block',()=>{
        const amount1 = 1000
        const amount2 = 1000
        const reward = 1000
        contract.deposit(userA, amount1, 0)
        contract.deposit(userB, amount2, 0)

        contract.distribute(reward, 100)
        const _reward = reward/(amount1+amount2)
        expect(contract.userBalance(userA)).toBeCloseTo(amount1 + amount1*_reward, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 + amount2*_reward, 8)
    })

    test('distributes tokens proportionally if invested on the same block',()=>{
        const amount1 = 1000
        const amount2 = 500
        const reward = 1000
        contract.deposit(userA, amount1, 0)
        contract.deposit(userB, amount2, 0)

        contract.distribute(reward, 100)
        const _reward = reward/(amount1+amount2)
        expect(contract.userBalance(userA)).toBeCloseTo(amount1 + amount1*_reward, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 + amount2*_reward, 8)
    })

    test('distributes tokens proportionally if invested on different blocks',()=>{
        const amount1 = 1000
        const amount2 = 1000

        const block1 = 0
        const block2 = 25
        const rewardBlock = 50

        const reward = 3000
        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)

        contract.distribute(reward, rewardBlock)

        expect(contract.userBalance(userA)).toBeCloseTo(3000, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(2000, 8)
    })

    test('distributes tokens proportionally if invested on different blocks and had multiple deposits from the same user',()=>{
        const amount1 = 500
        const amount2 = 1000
        const amount3 = 500

        const block1 = 0
        const block2 = 25
        const rewardBlock = 50

        const reward = 1000
        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block1)
        contract.deposit(userA, amount3, block2)

        contract.distribute(reward, rewardBlock)

        expect(contract.userBalance(userA)).toBeCloseTo(1428.5714285714284, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(1571.4285714285716, 8)
    })
})
describe('actions dont affect deposits or rewards in an unintended way', () => {
    describe('deposit doesnt affect other parameters',()=>{
        const amount1 = 1000
        const amount2 = 1000
        const reward = 1000
        let _reward =0
        beforeEach(() => {
            //deposit 1000 tokens at the same time for both users
            contract.deposit(userB, amount1, 0)
            contract.deposit(userA, amount2, 0)
            //deposit 1 token right before the distribution
            contract.deposit(userA, 1, 100)
            contract.distribute(reward, 100)
            _reward = reward/(amount1+amount2)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(amount1*_reward, 8)
            expect(contract.userReward(userB)).toBeCloseTo(amount2*_reward, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 + amount1*_reward + 1, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 + amount2*_reward, 8)
        })
    })

    describe('withdraw doesnt affect paramenters if deposits were made on the same block',()=>{
        const amount1 = 1000
        const amount2 = 1000
        const reward = 1000
        let _reward =0
        beforeEach(() => {
            //deposit 1000 tokens at the same time for both users
            contract.deposit(userB, amount1, 0)
            contract.deposit(userA, amount2, 0)
            //withdraw and deposit 1 token right before the distribution
            contract.withdraw(userA, 1, 100)
            contract.deposit(userA, 1, 100)
            contract.distribute(reward, 100)
            _reward = reward/(amount1+amount2)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(amount1*_reward, 8)
            expect(contract.userReward(userB)).toBeCloseTo(amount2*_reward, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 + amount1*_reward, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 + amount2*_reward, 8)
        })
    })
    describe('withdraw doesnt affect parameters in an unintended way if deposits were made on different blocks', () => {
        const reward = 3000
        beforeEach(() => {
            const amount1 = 1000
            const amount2 = 1000

            //deposit same amount on different blocks
            contract.deposit(userB, amount1, 0)
            contract.deposit(userA, amount2, 200)
            //withdraw 1 token right before the distribution
            contract.withdraw(userA, 1, 400)
            contract.deposit(userA, 1, 400)
            contract.distribute(reward, 400)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(1000, 8)
            expect(contract.userReward(userB)).toBeCloseTo(2000, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(2000, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(3000, 8)
        })
    })

    describe('previous actions dont affect distribution if all users deposited same amount of tokens on the same block',()=>{
        const amount1 = 1000
        const amount2 = 1000
        const reward = 1000
        let _reward = 0

        beforeEach(() => {
            //make random actions to set variables
            contract.deposit(userB, 1000, 0)
            contract.deposit(userA, 2000, 200)
            contract.withdraw(userA, 1000,300)

            //withdraw all tokens
            contract.withdraw(userB, contract.userBalance(userB), 400)
            contract.withdraw(userA, contract.userBalance(userA), 400)
            //deposit 1000 for each user
            contract.deposit(userB, amount1, 400)
            contract.deposit(userA, amount2, 400)
            contract.distribute(reward, 500)
            _reward = reward/(amount1+amount2)
        })

        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(amount1*_reward, 8)
            expect(contract.userReward(userB)).toBeCloseTo(amount2*_reward, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 + amount1*_reward, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 + amount2*_reward, 8)
        })

    })
})

test('random scenario',()=>{
    const reward1 = 2000
    const reward2 = 3000

    contract.deposit(userA, 500, 20)
    contract.deposit(userB, 700, 40)
    contract.deposit(userC, 200, 45)
    contract.distribute(reward1, 50)
    let rewardA = contract.userReward(userA)
    let rewardB = contract.userReward(userB)
    let rewardC = contract.userReward(userC)
    let rewardD = 0

    expect(rewardA + rewardB + rewardC + rewardD).toBeCloseTo(reward1, 8)
    expect(contract.getTotalDeposits()).toBeCloseTo(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC), 8)

    const balanceC = contract.userBalance(userC)
    contract.withdraw(userC,balanceC, 60)
    contract.deposit(userC, balanceC, 60)

    contract.deposit(userD, 1000, 80)
    contract.distribute(reward2, 100)
    rewardA = contract.userReward(userA)
    rewardB = contract.userReward(userB)
    rewardC += contract.userReward(userC) //we add rewardC because we withdrawn previous reward
    rewardD = contract.userReward(userD)


    expect(rewardA + rewardB + rewardC + rewardD).toBeCloseTo(reward1 + reward2, 8)
    expect(contract.getTotalDeposits()).toBeCloseTo(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC) + contract.userBalance(userD), 8)
})