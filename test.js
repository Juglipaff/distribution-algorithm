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
            expect(contract.userReward(userA)).toBeCloseTo(amount2*_reward, 8)
            expect(contract.userReward(userB)).toBeCloseTo(amount1*_reward, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount2 + amount2*_reward, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount1 + amount1*_reward, 8)
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

    describe('withdraw doesnt affect parameters in an unintended way', () => {
        const reward = 1000
        beforeEach(() => {
            const amount1 = 1000
            const amount2 = 1000

            //deposit same amount on different blocks
            contract.deposit(userA, amount1, 0)
            contract.withdraw(userA, amount1, 5)
            contract.deposit(userA, amount1, 10)
            contract.deposit(userB, amount2, 10)
            contract.distribute(reward, 20)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(600, 8)
            expect(contract.userReward(userB)).toBeCloseTo(400, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(1600, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(1400, 8)
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
            expect(contract.userReward(userA)).toBeCloseTo(444.44444444444444, 8)
            expect(contract.userReward(userB)).toBeCloseTo(555.55555555555555, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(1444.44444444444444, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(1555.55555555555555, 8)
        })

    })
})
describe('random scenarios', () => {
    test('1',()=>{
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

        expect(rewardA).toBeCloseTo(1304.3478260869565, 8)
        expect(rewardB).toBeCloseTo(608.695652173913, 8)
        expect(rewardC).toBeCloseTo(86.95652173913038, 8)
        expect(rewardA + rewardB + rewardC + rewardD).toBeCloseTo(reward1, 8)
        expect(contract.getTotalDeposits()).toBeCloseTo(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC), 8)

        contract.withdraw(userC, 200, 60)
        contract.deposit(userC, 200, 60) //happen on the same block

        contract.deposit(userD, 1000, 80)
        contract.distribute(reward2, 100)
        rewardA = contract.userReward(userA)
        rewardB = contract.userReward(userB)
        rewardC = contract.userReward(userC)
        rewardD = contract.userReward(userD)

        expect(rewardA).toBeCloseTo(2137.68115942029, 8)
        expect(rewardB).toBeCloseTo(1775.36231884058, 8)
        expect(rewardC).toBeCloseTo(420.2898550724638, 8)
        expect(rewardD).toBeCloseTo(666.6666666666665, 8)
        expect(rewardA + rewardB + rewardC + rewardD).toBeCloseTo(reward1 + reward2, 8)
        expect(contract.getTotalDeposits()).toBeCloseTo(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC) + contract.userBalance(userD), 8)
    })
    test('2',()=>{
        contract.deposit(userA, 500, 0)
        contract.withdraw(userA, 300, 20)
        contract.distribute(1000, 50)

        expect(contract.userBalance(userA)).toBeCloseTo(1200, 8)
    })
    test('3',()=>{
        const reward = 1000
        contract.deposit(userA, 501, 0)
        contract.deposit(userB, 500, 0)
        contract.withdraw(userA, 1, 0)

        contract.distribute(reward, 50) 

        expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(contract.getTotalDeposits(), 8)
        expect(contract.userBalance(userA)).toBeCloseTo(1000, 8)
        expect(contract.userBalance(userA)).toBeCloseTo(1000, 8)
    })
    describe('4',()=>{
        const reward = 1000
        beforeEach(() => {
            contract.deposit(userA, 501, 0)
            contract.deposit(userB, 500, 0)
            contract.withdraw(userA, 1, 0)

            contract.withdraw(userA, 200, 0)
            contract.deposit(userA, 200, 0)

            contract.withdraw(userA, 300, 0)
            contract.deposit(userA, 300, 0)

            contract.distribute(reward, 50) 
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(500, 8)
            expect(contract.userReward(userB)).toBeCloseTo(500, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(1000, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(1000, 8)
        })
    })
    describe('5',()=>{
        const reward = 1000
        beforeEach(() => {
            contract.deposit(userA, 500, 0)
            contract.withdraw(userA, 500, 25)
            contract.deposit(userA, 1000, 25)
            contract.deposit(userB, 1000, 25)
            contract.distribute(reward, 50) 
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(600, 8)
            expect(contract.userReward(userB)).toBeCloseTo(400, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(1600, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(1400, 8)
        })
    })

    describe('6',()=>{
        const reward = 1200
        const amount = 1000
        beforeEach(() => {
            contract.deposit(userA, amount, 0)
            contract.withdraw(userA, amount, 5)
            contract.deposit(userA, amount, 10)
            contract.withdraw(userA, amount, 15)
            contract.deposit(userB, amount, 15)
            contract.withdraw(userB, amount, 20)

            contract.deposit(userB, amount, 25)
            contract.deposit(userA, amount, 25)

            contract.withdraw(userA, amount, 30)
            contract.deposit(userA, amount, 35)

            contract.distribute(reward, 50)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward/2, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward/2, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount+reward/2, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount+reward/2, 8)
        })
    })

    describe('7',()=>{
        const reward = 1200
        const amount = 1000
        beforeEach(() => {
            contract.deposit(userA, amount, 0)
            contract.deposit(userB, amount, 0)
            contract.deposit(userC, amount, 0)

            contract.withdraw(userA, amount - 500, 10)
            contract.deposit(userA, amount - 500, 10)

            contract.withdraw(userC, amount - 300, 20)
            contract.deposit(userC, amount - 300, 20)

            contract.withdraw(userA, amount, 30)

            contract.distribute(reward, 50)

        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)+ contract.userReward(userC)).toBeCloseTo(reward, 8)
        })
        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC) ).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBe(276.92307692307696)
            expect(contract.userReward(userB)).toBeCloseTo(461.5384615384616, 8)
            expect(contract.userReward(userC)).toBeCloseTo(461.5384615384616, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBe(276.92307692307696)
            expect(contract.userBalance(userB)).toBeCloseTo(amount + 461.5384615384616, 8)
            expect(contract.userBalance(userC)).toBeCloseTo(amount + 461.5384615384616, 8)
        })
    })

    describe('8',()=>{
        const reward = 1200
        const amount = 1000
        beforeEach(() => {
            contract.deposit(userA, amount, 0)
            contract.deposit(userB, amount, 0)
            contract.deposit(userC, amount, 0)

            contract.withdraw(userA, amount - 500, 10)
            contract.deposit(userA, amount - 500, 10)

            contract.withdraw(userC, amount - 300, 20)
            contract.deposit(userC, amount - 300, 20)

            contract.withdraw(userA, amount - 500, 25)

            contract.distribute(reward, 50)

        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)+ contract.userReward(userC)).toBeCloseTo(reward, 8)
        })
        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(327.27272727272725)
            expect(contract.userReward(userB)).toBeCloseTo(436.3636363636363, 8)
            expect(contract.userReward(userC)).toBeCloseTo(436.3636363636363, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount-500+327.27272727272725)
            expect(contract.userBalance(userB)).toBeCloseTo(amount+436.3636363636363, 8)
            expect(contract.userBalance(userC)).toBeCloseTo(amount+436.3636363636363, 8)
        })
        
    })
    describe('9',()=>{
       // let rewardB = 0
        beforeEach(() => {
            contract.deposit(userA, 1000, 0)
            contract.deposit(userB, 1000, 0)
            contract.deposit(userC, 1000, 0)

            contract.withdraw(userA, 500, 10)
            contract.deposit(userA, 500, 10)

            contract.withdraw(userC, 700, 20)
            contract.deposit(userC, 700, 20)

            contract.withdraw(userA, 500, 25)

            contract.distribute(1000, 50)
            contract.deposit(userD, 500, 50)

            contract.deposit(userB, 1500, 60)

            contract.distribute(1000, 100)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB) + contract.userReward(userC) + contract.userReward(userD)).toBeCloseTo(2000, 8)
        })

        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC) + contract.userBalance(userD)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
    })

    describe('10',()=>{
        beforeEach(() => {
            contract.deposit(userA, 1000, 0)
            contract.distribute(1000, 50)

            contract.deposit(userB, 1000, 50)
            contract.distribute(1000, 100)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(1500, 8)
            expect(contract.userReward(userB)).toBeCloseTo(500, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(2500, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(1500, 8)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(2000, 8)
        })

        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
    }),

    describe('11',()=>{
        const userE = 'E'
        let rewardA1 = 0
        let rewardB1 = 0
        let rewardC1 = 0
        let rewardD1 = 0
        let rewardE1 = 0

        let rewardA2 = 0
        let rewardB2 = 0
        let rewardC2 = 0
        let rewardD2 = 0
        let rewardE2 = 0

        let rewardA3 = 0
        let rewardB3 = 0
        let rewardC3 = 0
        let rewardD3 = 0
        let rewardE3 = 0

        let rewardA4 = 0
        let rewardB4 = 0
        let rewardC4 = 0
        let rewardD4 = 0
        let rewardE4 = 0

        let rewardA5 = 0
        let rewardB5 = 0
        let rewardC5 = 0
        let rewardD5 = 0
        let rewardE5 = 0

        let rewardA6 = 0
        let rewardB6 = 0
        let rewardC6 = 0
        let rewardD6 = 0
        let rewardE6 = 0

        let rewardA7 = 0
        let rewardB7 = 0
        let rewardC7 = 0
        let rewardD7 = 0
        let rewardE7 = 0

        let rewardA8 = 0
        let rewardB8 = 0
        let rewardC8 = 0
        let rewardD8 = 0
        let rewardE8 = 0
        beforeEach(() => {
           contract.deposit(userA, 1000, 0)
           contract.deposit(userB, 1000, 0)
           contract.deposit(userC, 1000, 0)

           contract.withdraw(userA, 500, 10)
           contract.deposit(userA, 500, 10)

           contract.withdraw(userC, 700, 20)
           contract.deposit(userC, 700, 20)

           contract.withdraw(userA, 500, 25)

           contract.distribute(1000, 50)
           
           rewardA1 = contract.userReward(userA)
           rewardB1 = contract.userReward(userB)
           rewardC1 = contract.userReward(userC)
           rewardD1 = contract.userReward(userD)
           rewardE1 = contract.userReward(userE)
           contract.deposit(userD, 500, 50)
           //rewardB = contract.userReward(userB)
           contract.deposit(userB, 1500, 60)
           contract.distribute(1000, 100)

           rewardA2 = contract.userReward(userA)
           rewardB2 = contract.userReward(userB)
           rewardC2 = contract.userReward(userC)
           rewardD2 = contract.userReward(userD)
           rewardE2 = contract.userReward(userE)
           contract.distribute(1000, 149)

           rewardA3 = contract.userReward(userA)
           rewardB3 = contract.userReward(userB)
           rewardC3 = contract.userReward(userC)
           rewardD3 = contract.userReward(userD)
           rewardE3 = contract.userReward(userE)
           contract.distribute(1000, 200)

           rewardA4 = contract.userReward(userA)
           rewardB4 = contract.userReward(userB)
           rewardC4 = contract.userReward(userC)
           rewardD4 = contract.userReward(userD)
           rewardE4 = contract.userReward(userE)
           contract.withdraw(userA, 500, 225)
           contract.deposit(userA, 500, 225)
           contract.distribute(1000, 250)

           rewardA5 = contract.userReward(userA)
           rewardB5 = contract.userReward(userB)
           rewardC5 = contract.userReward(userC)
           rewardD5 = contract.userReward(userD)
           rewardE5 = contract.userReward(userE)
           contract.deposit(userE, 500, 275)
           contract.distribute(1000, 290)

           rewardA6 = contract.userReward(userA)
           rewardB6 = contract.userReward(userB)
           rewardC6 = contract.userReward(userC)
           rewardD6 = contract.userReward(userD)
           rewardE6 = contract.userReward(userE)
           contract.distribute(1000, 300)

           rewardA7 = contract.userReward(userA)
           rewardB7 = contract.userReward(userB)
           rewardC7 = contract.userReward(userC)
           rewardD7 = contract.userReward(userD)
           rewardE7 = contract.userReward(userE)

           contract.withdraw(userC, 500, 300)
           contract.withdraw(userD, 500, 300)
           contract.distribute(1000, 350)

           rewardA8 = contract.userReward(userA)
           rewardB8 = contract.userReward(userB)
           rewardC8 = contract.userReward(userC)
           rewardD8 = contract.userReward(userD)
           rewardE8 = contract.userReward(userE)

        })
        test('rewards are right after the first distribution',()=>{
           expect(rewardA1).toBeCloseTo(272.72727272727275, 8)
           expect(rewardB1).toBeCloseTo(363.6363636363636, 8)
           expect(rewardC1).toBeCloseTo(363.6363636363636, 8)
           expect(rewardD1).toBeCloseTo(0, 8)
           expect(rewardE1).toBeCloseTo(0, 8)
        })
        test('rewards are right after the second distribution',()=>{
           expect(rewardA2).toBeCloseTo(391.7748917748918, 8)
           expect(rewardB2).toBeCloseTo(887.4458874458875, 8)
           expect(rewardC2).toBeCloseTo(601.7316017316018, 8)
           expect(rewardD2).toBeCloseTo(119.04761904761907, 8)
           expect(rewardE2).toBeCloseTo(0, 8)
        })
        test('rewards are right after the third distribution',()=>{
           expect(rewardA3).toBeCloseTo(502.8860028860029, 8)
           expect(rewardB3).toBeCloseTo(1443.001443001443, 8)
           expect(rewardC3).toBeCloseTo(823.953823953824, 8)
           expect(rewardD3).toBeCloseTo(230.15873015873018, 8)
           expect(rewardE3).toBeCloseTo(0, 8)
        })
        test('rewards are right after the fourth distribution',()=>{
           expect(rewardA4).toBeCloseTo(613.9971139971141, 8)
           expect(rewardB4).toBeCloseTo(1998.5569985569987, 8)
           expect(rewardC4).toBeCloseTo(1046.1760461760464, 8)
           expect(rewardD4).toBeCloseTo(341.2698412698413, 8)
           expect(rewardE4).toBeCloseTo(0, 8)
        })
        test('rewards are right after the fifth distribution',()=>{
           expect(rewardA5).toBeCloseTo(725.1082251082252, 8)
           expect(rewardB5).toBeCloseTo(2554.112554112554, 8)
           expect(rewardC5).toBeCloseTo(1268.3982683982686, 8)
           expect(rewardD5).toBeCloseTo(452.3809523809524, 8)
           expect(rewardE5).toBeCloseTo(0, 8)
        })
        test('rewards are right after the sixth distribution',()=>{
           expect(rewardA6).toBeCloseTo(831.7748917748918, 8)
           expect(rewardB6).toBeCloseTo(3087.4458874458874, 8)
           expect(rewardC6).toBeCloseTo(1481.7316017316016, 8)
           expect(rewardD6).toBeCloseTo(559.047619047619, 8)
           expect(rewardE6).toBeCloseTo(40, 8)
        })
        test('rewards are right after the seventh distribution',()=>{
            expect(rewardA7).toBeCloseTo(931.7748917748918, 8)
            expect(rewardB7).toBeCloseTo(3587.4458874458874, 8)
            expect(rewardC7).toBeCloseTo(1681.731601731602, 8)
            expect(rewardD7).toBeCloseTo(659.047619047619, 8)
            expect(rewardE7).toBeCloseTo(140, 8)
        })
        test('rewards are right after the eighth distribution',()=>{
            expect(rewardA8).toBeCloseTo(1056.7748917748918, 8)
            expect(rewardB8).toBeCloseTo(4212.445887445888, 8)
            expect(rewardC8).toBeCloseTo(1806.731601731602, 8)
            expect(rewardD8).toBeCloseTo(659.047619047619, 8)
            expect(rewardE8).toBeCloseTo(265, 8)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB) + contract.userReward(userC) + contract.userReward(userD) + contract.userReward(userE)).toBeCloseTo(8000, 8)
        })

        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC) + contract.userBalance(userD) + contract.userBalance(userE)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
     })
})