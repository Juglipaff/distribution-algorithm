const Contract = require('./contract.js');

const userA = 'A'
const userB = 'B'
const userC = 'C'
const userD = 'D'
const userE = 'E'

let c
beforeEach(() => {c = new Contract()})

describe('deposits', () => {
    test('deposits tokens for one user', () => {
        const amount = 1000
        c.deposit(userA, amount, 0)
        c.setExpectedReward(100, 100)
        expect(c.userBalance(userA)).toBeCloseTo(amount, 8)
        expect(c.userBalance(userA)).toBeCloseTo(c.getTotalDeposits(), 8)
    })

    test('deposits tokens for multiple users', () => {
        const amount1 = 500
        const amount2 = 1000
        const amount3 = 1200
        c.deposit(userA, amount1, 0)
        c.deposit(userB, amount2, 0)
        c.deposit(userC, amount3, 0)
        c.setExpectedReward(200, 100)

        expect(c.userBalance(userA)).toBeCloseTo(amount1, 1)
        expect(c.userBalance(userB)).toBeCloseTo(amount2, 1)
        expect(c.userBalance(userC)).toBeCloseTo(amount3, 1)

        expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(amount1 + amount2 + amount3, 8)
        expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(c.getTotalDeposits(), 8)
    })

    test('deposits add up', () => {
        const amount1 = 500
        const amount2 = 1000
        const amount3 = 1200

        const amount4 = 600
        const amount5 = 2000
        const amount6 = 3200

        c.deposit(userA, amount1, 0)
        c.deposit(userB, amount2, 0)
        c.deposit(userC, amount3, 0)

        c.deposit(userA, amount4, 0)
        c.deposit(userB, amount5, 0)
        c.deposit(userC, amount6, 0)
        c.setExpectedReward(500, 100)

        expect(c.userBalance(userA)).toBeCloseTo(amount1 + amount4, 1)
        expect(c.userBalance(userB)).toBeCloseTo(amount2 + amount5, 1)
        expect(c.userBalance(userC)).toBeCloseTo(amount3 + amount6, 1)

        expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(amount1 + amount2 + amount3 + amount4 + amount5 + amount6, 8)
        expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(c.getTotalDeposits(), 8)
    })
})

describe('withdraws', () => {
    test('withdraws tokens for one user', () => {
        const amount1 = 500
        const withdraw_amount1 = 300
        c.deposit(userA, amount1, 0)
        c.setExpectedReward(50, 100)
        c.withdraw(userA, withdraw_amount1, 50)
        expect(c.userBalance(userA)).toBeCloseTo(amount1 - withdraw_amount1, 1)
        expect(c.userBalance(userA)).toBeCloseTo(c.getTotalDeposits(), 8)
    })

    test('withdraws tokens for multiple users', () => {
        const amount1 = 500
        const amount2 = 1000
        const amount3 = 1200

        const withdraw_amount1 = 300
        const withdraw_amount2 = 700
        const withdraw_amount3 = 900
        c.deposit(userA, amount1, 0)
        c.deposit(userB, amount2, 0)
        c.deposit(userC, amount3, 0)
        c.setExpectedReward(250, 100)

        c.withdraw(userA, withdraw_amount1, 30)
        c.withdraw(userB, withdraw_amount2, 40)
        c.withdraw(userC, withdraw_amount3, 50)

        expect(c.userBalance(userA)).toBeCloseTo(amount1 - withdraw_amount1, 1)
        expect(c.userBalance(userB)).toBeCloseTo(amount2 - withdraw_amount2, 1)
        expect(c.userBalance(userC)).toBeCloseTo(amount3 - withdraw_amount3, 1)

        expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(amount1 + amount2 + amount3 - withdraw_amount1 - withdraw_amount2 - withdraw_amount3, 8)
        expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(c.getTotalDeposits(), 8)
    })
})

describe('distributes', () => {
    test('distributes tokens equally if invested the same amount on the same block', ()=>{
        const amount1 = 1000
        const amount2 = 1000

        const block1 = 0
        const block2 = 0
        const block3 = 100

        const reward = 1000

        c.deposit(userA, amount1, block1)
        c.deposit(userB, amount2, block2)
        c.setExpectedReward(reward, block3)
        c.distribute(reward, block3)

        const userADepositAge = (block3 - block1)*amount1
        const userBDepositAge = (block3 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        expect(c.userBalance(userA)).toBeCloseTo(amount1 + reward*userADepositAge/totalDepositAge, 1)
        expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 1)
        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 + reward, 8)
        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
    })

    test('distributes tokens proportionally if invested different amounts on the same block', () => {
        const amount1 = 1000
        const amount2 = 500

        const block1 = 0
        const block2 = 0
        const block3 = 100

        const reward = 1000

        c.deposit(userA, amount1, block1)
        c.deposit(userB, amount2, block2)
        c.setExpectedReward(reward, block3)
        c.distribute(reward, block3)

        const userADepositAge = (block3 - block1)*amount1
        const userBDepositAge = (block3 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        expect(c.userBalance(userA)).toBeCloseTo(amount1 + reward*userADepositAge/totalDepositAge, 1)
        expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 1)
        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 + reward, 8)
        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
    })

    test('distributes tokens proportionally if invested the same amount on different blocks',()=>{
        const amount1 = 1000
        const amount2 = 1000

        const block1 = 0
        const block2 = 25
        const block3 = 50

        const reward = 3000

        c.deposit(userA, amount1, block1)   // 1000, 0
        c.setExpectedReward(2000, block3)
        c.deposit(userB, amount2, block2)   // 1000, 25
        c.setExpectedReward(reward, block3)
        c.distribute(reward, block3)        // 3000, 50

        const userADepositAge = (block3 - block1)*amount1
        const userBDepositAge = (block3 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        expect(c.userBalance(userA)).toBeCloseTo(amount1 + reward*userADepositAge/totalDepositAge, 1)
        expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 1)
        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 + reward, 8)
        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
    })

    test('distributes tokens proportionally if invested on different blocks and had multiple deposits from the same user',()=>{
        const amount1 = 500
        const amount2 = 1000
        const amount3 = 500

        const block1 = 0
        const block2 = 0
        const block3 = 25
        const block4 = 50

        const reward = 1000
        c.deposit(userA, amount1, block1)   // 500, 0
        c.deposit(userB, amount2, block2)   // 1000, 0
        c.setExpectedReward(857, block4)
        c.deposit(userA, amount3, block3)   // 500, 25
        c.setExpectedReward(reward, block4)

        c.distribute(reward, block4)        // 1000, 50

        const userADepositAge = (block3 - block1)*amount1 + (block4 - block3)*(amount1 + amount3)
        const userBDepositAge = (block4 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        expect(c.userBalance(userA)).toBeCloseTo(amount1 + amount3 + reward*userADepositAge/totalDepositAge, 1)
        expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 1)
        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 + amount3 + reward, 8)
        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
    })
})

describe('rewards distributed correctly', () => {
    describe('rewards distributed correctly after making multiple deposits on the same block',()=>{
        const amount1 = 1000
        const amount2 = 1000
        const amount3 = 1
        const reward = 1000

        const block1 = 0
        const block2 = 0
        const block3 = 100
        const block4 = 100

        const userADepositAge = (block3 - block1)*amount1 + (block4 - block3)*(amount1 + amount3)
        const userBDepositAge = (block4 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        beforeEach(() => {
            //deposit 1000 tokens at the same time for both users
            c.deposit(userA, amount1, block1)   // 1000, 0
            c.deposit(userB, amount2, block2)   // 1000, 0
            c.setExpectedReward(999.5, block4)
            //deposit 1 token right before the distribution
            c.deposit(userA, amount3, block3)   // 1, 100
            c.distribute(reward, block4)        // 10000, 100
        })

        test('doesnt affect deposits',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 + amount3 + reward*userADepositAge/totalDepositAge, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 1)
        })
        test('sum of tokens is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 + amount3 + reward, 8)
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
        })
    })
    describe('rewards distributed correctly after withdrawal with multiple deposits on the same block',()=>{
        const amount1 = 1000
        const amount2 = 1000
        const amount3 = 750
        const reward = 1000

        const block1 = 0
        const block2 = 0
        const block3 = 100
        const block4 = 100

        const userADepositAge = (block3 - block1)*amount1 + (block4 - block3)*(amount1 - amount3)
        const userBDepositAge = (block4 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        beforeEach(() => {
            //deposit 1000 tokens at the same time for both users
            c.deposit(userA, amount1, block1)
            c.deposit(userB, amount2, block2)
            c.setExpectedReward(reward, block4)
            //withdraw 750 tokens right before the distribution
            c.withdraw(userA, amount3, block3)
            c.distribute(reward, block4)
        })

        test('doesnt affect deposits',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 - amount3 + reward*userADepositAge/totalDepositAge, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 1)
        })
        test('sum of tokens is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 - amount3 + reward, 8)
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
        })
    })
    describe('rewards distributed correctly after withdrawal with multiple deposits on different blocks', () => {
        const amount1 = 1000
        const amount2 = 1000
        const amount3 = 1
        const reward = 3000

        const block1 = 0
        const block2 = 200
        const block3 = 400
        const block4 = 400

        const userADepositAge = (block4 - block1)*amount1 
        const userBDepositAge = (block3 - block2)*amount2 + (block4 - block3)*(amount2 - amount3)
        const totalDepositAge = userADepositAge + userBDepositAge
        beforeEach(() => {
            //deposit same amount on different blocks
            c.deposit(userA, amount1, block1)
            c.setExpectedReward(2000, block4)
            c.deposit(userB, amount2, block2)
            c.setExpectedReward(reward, block4)
            //withdraw 1 token right before the distribution
            c.withdraw(userB, amount3, block3)
            c.distribute(reward, block4)
        })

        test('doesnt affect deposits',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 + reward*userADepositAge/totalDepositAge, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount2 - amount3 + reward*userBDepositAge/totalDepositAge, 1)
        })
        test('sum of tokens is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 - amount3 + reward, 8)
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
        })
    })
    describe('rewards distributed correctly after multiple withdrawals and deposits on different blocks', () => {
        const amount1 = 1000
        const amount2 = 1000
        const amount3 = 1000
        const amount4 = 1000
        const reward = 1000

        const block1 = 0
        const block2 = 5
        const block3 = 10
        const block4 = 10
        const block5 = 20

        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 - amount2) + (block5 - block3)*(amount1 - amount2 + amount3)
        const userBDepositAge = (block5 - block4)*amount4
        const totalDepositAge = userADepositAge + userBDepositAge

        beforeEach(() => {
            c.deposit(userA, amount1, block1)
            c.setExpectedReward(800, block5)
            c.withdraw(userA, amount2, block2)
            c.setExpectedReward(200, block5)

            c.deposit(userA, amount3, block3)
            c.deposit(userB, amount4, block4)
            c.setExpectedReward(reward, block5)
            c.distribute(reward, block5)
        })

        test('doesnt affect deposits',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 - amount2 + amount3 + reward*userADepositAge/totalDepositAge, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount4 + reward*userBDepositAge/totalDepositAge, 1)
        })
        test('sum of tokens is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 - amount2 + amount3 + amount4 + reward, 8)
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
        })
    })
    
    describe('rewards distributed correctly after multiple withdrawals and deposits on different blocks from two users',()=>{
        const amount1 = 1000
        const amount2 = 2000
        const amount3 = 1000
        const amount4 = 1000
        const amount5 = 1000
        const amount6 = 1000
        const amount7 = 1000
        const reward = 1000

        const block1 = 0
        const block2 = 200
        const block3 = 300
        const block4 = 400
        const block5 = 400
        const block6 = 400
        const block7 = 400
        const block8 = 500

        const userADepositAge = (block4 - block1)*amount1 + (block7 - block4)*(amount1 - amount4) + (block8 - block7)*(amount1 - amount4 + amount7)
        const userBDepositAge = (block3 - block2)*amount2 + (block5 - block3)*(amount2 - amount3) + (block6 - block5)*(amount2 - amount3 - amount5) + (block8 - block6)*(amount2 - amount3 - amount5 + amount6)
        const totalDepositAge = userADepositAge + userBDepositAge

        beforeEach(() => {
            //make random actions to set variables
            c.deposit(userA, amount1, block1)   // 1000, 0
            c.setExpectedReward(555.556, block8)
            c.deposit(userB, amount2, block2)   // 2000, 200
            c.setExpectedReward(1222.222, block8)
            c.withdraw(userB, amount3,block3)   // 1000, 300
            c.setExpectedReward(1000, block8)
            
            //withdraw all tokens
            c.withdraw(userA, amount4, block4)  // 1000, 400
            c.withdraw(userB, amount5, block5)  // 1000, 400
            c.setExpectedReward(777.778, block8)
            
            //deposit 1000 for each user
            c.deposit(userB, amount6, block6)   // 1000, 400
            c.deposit(userA, amount7, block7)   // 1000, 400
            c.setExpectedReward(reward, block8)
            c.distribute(reward, block8)        // 1000, 500
        })


        test('doesnt affect deposits',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 - amount4 + amount7 + reward*userADepositAge/totalDepositAge, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount2 - amount3 - amount5 + amount6 + reward*userBDepositAge/totalDepositAge, 1)
        })
        test('sum of tokens is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 - amount3 - amount4 - amount5 + amount6 + amount7 + reward, 8)
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
        })
    })
})
//some scenarios that made previos code fail
describe('random scenarios', () => {
    describe('rewards distributed correctly after two distributions with multiple users joining at different times',()=>{
        const amount1 = 500
        const amount2 = 700
        const amount3 = 200
        const reward1 = 2000

        const block1 = 20
        const block2 = 40
        const block3 = 45
        const block4 = 50

        const userADepositAge1 = (block4 - block1)*amount1
        const userBDepositAge1 = (block4 - block2)*amount2 
        const userCDepositAge1 = (block4 - block3)*amount3
        const totalDepositAge1 = userADepositAge1 + userBDepositAge1 + userCDepositAge1
        let rewardA1 = 0
        let rewardB1 = 0
        let rewardC1 = 0
        let rewardD1 = 0
        let totalDeposits1 = 0

        const amount5 = 200
        const amount6 = 200
        const amount7 = 1000
        const reward2 = 3000

        const block5 = 60
        const block6 = 60
        const block7 = 80
        const block8 = 100

        const userADepositAge2 = (block8 - block4)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge2 = (block8 - block4)*(amount2 + reward1*userBDepositAge1/totalDepositAge1)
        const userCDepositAge2 = (block5 - block4)*(amount3 + reward1*userCDepositAge1/totalDepositAge1) + (block6 - block5)*(amount3 - amount5 + reward1*userCDepositAge1/totalDepositAge1) + (block8 - block6)*(amount3 - amount5 + amount6 + reward1*userCDepositAge1/totalDepositAge1)
        const userDDepositAge2 = (block8 - block7)*amount7
        const totalDepositAge2 = userADepositAge2 + userBDepositAge2 + userCDepositAge2 + userDDepositAge2


        let rewardA2 = 0
        let rewardB2 = 0
        let rewardC2 = 0
        let rewardD2 = 0
        let totalDeposits2 = 0

        beforeEach(() => {
            c.deposit(userA, amount1, block1)    // 500, 20
            c.setExpectedReward(1304.348, block4)
            c.deposit(userB, amount2, block2)    // 700, 40
            c.setExpectedReward(1913.043, block4)
            c.deposit(userC, amount3, block3)    // 200, 45
            c.setExpectedReward(reward1, block4)
            c.distribute(reward1, block4)        // 2000, 50

            rewardA1 = c.userBalance(userA)
            rewardB1 = c.userBalance(userB)
            rewardC1 = c.userBalance(userC)
            rewardD1 = c.userBalance(userD)
            totalDeposits1 = c.getTotalDeposits()

            c.setExpectedReward(2684.211, block8)
            c.withdraw(userC, amount5, block5)  // 200, 60
            c.deposit(userC, amount6, block6)   // 200, 60
            c.setExpectedReward(2684.211, block8)
            c.deposit(userD, amount7, block7)   // 1000, 80
            c.setExpectedReward(reward2, block8)
            c.distribute(reward2, block8)    // 3000, 100

            rewardA2 = c.userBalance(userA)
            rewardB2 = c.userBalance(userB)
            rewardC2 = c.userBalance(userC)
            rewardD2 = c.userBalance(userD)
            totalDeposits2 = c.getTotalDeposits()

        })
        test('rewards after the first distribution are correct',()=>{
            expect(rewardA1).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1, 1)
            expect(rewardB1).toBeCloseTo(amount2 + reward1*userBDepositAge1/totalDepositAge1, 1)
            expect(rewardC1).toBeCloseTo(amount3 + reward1*userCDepositAge1/totalDepositAge1, 1)
            expect(rewardD1).toBeCloseTo(0, 1)
        })
        test('sum of rewards after the first distribution is consistent',()=>{
            expect(rewardA1 + rewardB1 + rewardC1 + rewardD1).toBeCloseTo(totalDeposits1, 8)
            expect(rewardA1 + rewardB1 + rewardC1 + rewardD1).toBeCloseTo(amount1 + amount2 + amount3 + reward1, 8)
        })

        test('rewards after the second distribution are correct',()=>{
            expect(rewardA2).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 1)
            expect(rewardB2).toBeCloseTo(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2, 1)
            expect(rewardC2).toBeCloseTo(amount3 - amount5 + amount6 + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2, 1)
            expect(rewardD2).toBeCloseTo(amount7 + reward2*userDDepositAge2/totalDepositAge2, 1)
        })
        test('sum of rewards after the second distribution is consistent',()=>{
            expect(rewardA2 + rewardB2 + rewardC2 + rewardD2).toBeCloseTo(totalDeposits2, 8)
            expect(rewardA2 + rewardB2 + rewardC2 + rewardD2).toBeCloseTo(amount1 + amount2 + amount3 + reward1 - amount5 + amount6 + amount7 + reward2, 8)
        })
    })

    test('rewards distributed correctly after some tokens were withdrawn by user mid strat',()=>{
        c.deposit(userA, 500, 0)
        c.setExpectedReward(1563, 50)
        c.withdraw(userA, 300, 20)
        c.setExpectedReward(1000, 50)
        c.distribute(1000, 50)

        expect(c.userBalance(userA)).toBeCloseTo(1200, 1)
        expect(c.userBalance(userA)).toBeCloseTo(c.getTotalDeposits(), 8)
    })

    test('rewards distributed correctly if multiple actions happened on the same block',()=>{
        const amount1 = 700
        const amount2 = 500
        const amount3 = 200

        const amount4 = 200
        const amount5 = 200

        const amount6 = 300
        const amount7 = 300

        const reward = 1000

        const block1 = 0
        const block2 = 0
        const block3 = 0
        const block4 = 0
        const block5 = 0
        const block6 = 0
        const block7 = 0
        const block8 = 50
        c.deposit(userA, amount1, block1)   // 700, 0
        c.deposit(userB, amount2, block2)   // 500, 0
        c.withdraw(userA, amount3, block3)  // 200, 0
        
        c.withdraw(userA, amount4, block4)  // 200, 0
        c.deposit(userA, amount5, block5)   // 200, 0
        
        c.withdraw(userA, amount6, block6)  // 300, 0
        c.deposit(userA, amount7, block7)   // 300, 0
        c.setExpectedReward(reward, block8)
        
        c.distribute(reward, block8)        // 1000, 50

        const userADepositAge = 
            (block3 - block1)*amount1 +
            (block4 - block3)*(amount1 - amount3) +
            (block5 - block4)*(amount1 - amount3 - amount4) +
            (block6 - block5)*(amount1 - amount3 - amount4 + amount5) +
            (block7 - block6)*(amount1 - amount3 - amount4 + amount5 - amount6) + 
            (block8 - block7)*(amount1 - amount3 - amount4 + amount5 - amount6 + amount7)
        const userBDepositAge = (block8 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
        expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 - amount3 - amount4 + amount5 - amount6 + amount7 + reward, 8)
        expect(c.userBalance(userA)).toBeCloseTo(amount1 - amount3 - amount4 + amount5 - amount6 + amount7 + reward*userADepositAge/totalDepositAge, 1)
        expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 1)
    })

    describe('rewards distributed correctly with multiple deposits and withdraws on the same block',()=>{
        const amount1 = 1000
        const amount2 = 1000
        const amount3 = 1000
        const amount4 = 500
        const amount5 = 500
        const amount6 = 700
        const amount7 = 700
        const amount8 = 1000
        const reward = 1200

        const block1 = 0
        const block2 = 0
        const block3 = 0
        const block4 = 10
        const block5 = 10
        const block6 = 20
        const block7 = 20
        const block8 = 30
        const block9 = 50

        const userADepositAge = (block4 - block1)*amount1 + (block5 - block4)*(amount1 - amount4) + (block8 - block5)*(amount1 - amount4 + amount5) + (block9 - block8)*(amount1 - amount4 + amount5 - amount8)
        const userBDepositAge = (block9 - block2)*amount2
        const userCDepositAge = (block6 - block3)*amount3 + (block7 - block6)*(amount3 - amount6) + (block9 - block7)*(amount3 - amount6 + amount7)
        const totalDepositAge = userADepositAge + userBDepositAge + userCDepositAge

        beforeEach(() => {
            c.deposit(userA, amount1, block1)   // 1000, 0
            c.deposit(userB, amount2, block2)   // 1000, 0
            c.deposit(userC, amount3, block3)   // 1000, 0
            c.setExpectedReward(1384.615, block9)
            
            c.withdraw(userA, amount4, block4)  // 500, 10
            c.deposit(userA, amount5, block5)   // 500, 10
            
            c.withdraw(userC, amount6, block6)  // 700, 20
            c.deposit(userC, amount7, block7)   // 700, 20
            
            c.withdraw(userA, amount8, block8)  // 1000, 30
            c.setExpectedReward(reward, block9)
            c.distribute(reward, block9)        // 1200, 50
        })

        test('sum of stakes is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(c.getTotalDeposits(), 8)
            expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(amount1 + amount2 + amount3 - amount4 + amount5 - amount6 + amount7 - amount8 + reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 - amount4 + amount5 - amount8 + reward*userADepositAge/totalDepositAge, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 1)
            expect(c.userBalance(userC)).toBeCloseTo(amount3 - amount6 + amount7 + reward*userCDepositAge/totalDepositAge, 1)
        })
    })

    describe('rewards distributed correctly after multiple actions with multiple distributions',()=>{
        const amount1 = 1000
        const amount2 = 1000
        const amount3 = 1000
        const amount4 = 500
        const amount5 = 500
        const amount6 = 700
        const amount7 = 700
        const amount8 = 500
        const reward1 = 1000
        const amount10 = 500
        const amount11 = 1500
        const reward2 = 1000

        const block1 = 0
        const block2 = 0
        const block3 = 0
        const block4 = 10
        const block5 = 10
        const block6 = 20
        const block7 = 20
        const block8 = 25
        const block9 = 50
        const block10 = 50
        const block11 = 60
        const block12 = 100

        const userADepositAge1 = (block4 - block1)*amount1 + (block5 - block4)*(amount1 - amount4) + (block8 - block5)*(amount1 - amount4 + amount5) + (block9 - block8)*(amount1 - amount4 + amount5 - amount8)
        const userBDepositAge1 = (block9 - block2)*amount2
        const userCDepositAge1 = (block6 - block3)*amount3 + (block7 - block6)*(amount3 - amount6) + (block9 - block7)*(amount3 - amount6 + amount7)
        const totalDepositAge1 = userADepositAge1 + userBDepositAge1 + userCDepositAge1

        const userADepositAge2 = (block12 - block9)*(amount1 - amount4 + amount5 - amount8 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge2 = (block11 - block9)*(amount2 + reward1*userBDepositAge1/totalDepositAge1) + (block12 - block11)*(amount2 + amount11 + reward1*userBDepositAge1/totalDepositAge1)
        const userCDepositAge2 = (block12 - block9)*(amount3 - amount6 + amount7 + reward1*userCDepositAge1/totalDepositAge1)
        const userDDepositAge2 = (block12 - block10)*amount10 
        const totalDepositAge2 = userADepositAge2 + userBDepositAge2 + userCDepositAge2 + userDDepositAge2


        beforeEach(() => {
            c.deposit(userA, amount1, block1)   // 1000, 0
            c.deposit(userB, amount2, block2)   // 1000, 0
            c.deposit(userC, amount3, block3)   // 1000, 0
            c.setExpectedReward(1090.909, block9)
            c.withdraw(userA, amount4, block4)  // 500, 10
            c.deposit(userA, amount5, block5)   // 500, 10
            c.withdraw(userC, amount6, block6)  // 700, 20
            c.deposit(userC, amount7, block7)   // 700, 20
            c.withdraw(userA, amount8, block8)  // 500, 25
            c.setExpectedReward(reward1, block9)
            c.distribute(reward1, block9)       // 1000, 50
            c.setExpectedReward(673.077, block12)
            c.deposit(userD, amount10, block10) // 500, 50
            c.setExpectedReward(769.231, block12)
            c.deposit(userB, amount11, block11, true) // 1500, 60
            c.setExpectedReward(reward2, block12)
            c.distribute(reward2, block12)      // 1000, 100
        })
        test('sum of stakes is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC) + c.userBalance(userD)).toBeCloseTo(c.getTotalDeposits(), 8)
            expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC) + c.userBalance(userD)).toBeCloseTo(amount1 + amount2 + amount3 - amount4 + amount5 - amount6 + amount7 - amount8 + reward1 + amount10 + amount11 + reward2, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 - amount4 + amount5 - amount8 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount2 + amount11 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2, 1)
            expect(c.userBalance(userC)).toBeCloseTo(amount3 - amount6 + amount7 + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2, 1)
            expect(c.userBalance(userD)).toBeCloseTo(amount10 + reward2*userDDepositAge2/totalDepositAge2, 1)
        })
    })
    describe('rewards distributed correctly with redeposit',()=>{
        const amount1 = 1000
        const reward1 = 1000
        const amount3 = 1000
        const reward2 = 2000

        const block1 = 0
        const block2 = 50
        const block3 = 50
        const block4 = 100

        const userADepositAge1 = (block2 - block1)*amount1 
        const totalDepositAge1 = userADepositAge1

        const userADepositAge2 =  (block4 - block2)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge = (block4 - block3)*amount3
        const totalDepositAge2 = userADepositAge2 + userBDepositAge

        beforeEach(() => {
            c.deposit(userA, amount1, block1)   // 1000, 0
            c.setExpectedReward(reward1, block2)
            c.distribute(reward1, block2)       // 1000, 50

            c.setExpectedReward(reward1, block4)
            c.deposit(userB, amount3, block3)   // 1000, 50
            c.setExpectedReward(reward2, block4)
            c.distribute(reward2, block4)       // 2000, 100
        })
        test('doesnt affect rewards',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount3 + reward2*userBDepositAge/totalDepositAge2, 1)
        })

        test('sum of stakes is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + reward1 + amount3 + reward2, 8)
        })
    })
    describe('rewards distributed correctly with redeposit with larger distribution block',()=>{
        const amount1 = 1000
        const reward1 = 1000
        const amount3 = 1000
        const reward2 = 1000

        const block1 = 0
        const block2 = 50
        const block3 = 50
        const block4 = 10000

        const userADepositAge1 = (block2 - block1)*amount1 
        const totalDepositAge1 = userADepositAge1

        const userADepositAge2 =  (block4 - block2)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge = (block4 - block3)*amount3
        const totalDepositAge2 = userADepositAge2 + userBDepositAge 

        beforeEach(() => {
            c.deposit(userA, amount1, block1)   // 1000, 0
            c.setExpectedReward(reward1, block2)
            c.distribute(reward1, block2)       // 1000, 50

            c.setExpectedReward(667, block4)
            c.deposit(userB, amount3, block3)   // 1000, 50
            c.setExpectedReward(reward2, block4)
            c.distribute(reward2, block4)       // 1000, 10000
        })
        test('doesnt affect rewards',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount3 + reward2*userBDepositAge/totalDepositAge2, 1)
        })

        test('sum of stakes is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + reward1 + amount3 + reward2, 8)
        })
    })
    describe('rewards distributed correctly after multiple distributions for one user',()=>{
        beforeEach(() => {
            c.deposit(userA, 1000, 0)
            c.setExpectedReward(0, 50)
            c.distribute(0, 50)

            c.setExpectedReward(1000, 100)
            c.distribute(1000, 100)

            c.setExpectedReward(1000, 151)
            c.distribute(1000, 151)

            c.setExpectedReward(1000, 152)
            c.distribute(1000, 152)

            c.setExpectedReward(1000, 153)
            c.distribute(1000, 153)
        })
        test('doesnt affect deposits',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(5000, 1)
            expect(c.userBalance(userA)).toBeCloseTo(c.getTotalDeposits(), 8)
        })
    })

    describe('rewards distributed correctly after multiple distributions for multiple users',()=>{
        const amount1 = 1000
        const amount2 = 300
        const amount3 = 800
        const reward1 = 0
        const reward2 = 500
        const reward3 = 1000
        const reward4 = 700

        const block1 = 0
        const block2 = 5
        const block3 = 20
        const block4 = 50
        const block5 = 100
        const block6 = 151
        const block7 = 152

        const userADepositAge1 = (block4 - block1)*amount1 
        const userBDepositAge1 = (block4 - block2)*amount2
        const userCDepositAge1 = (block4 - block3)*amount3
        const totalDepositAge1 = userADepositAge1 + userBDepositAge1 + userCDepositAge1

        const userADepositAge2 = (block5 - block4)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge2 = (block5 - block4)*(amount2 + reward1*userBDepositAge1/totalDepositAge1)
        const userCDepositAge2 = (block5 - block4)*(amount3 + reward1*userCDepositAge1/totalDepositAge1)
        const totalDepositAge2 = userADepositAge2 + userBDepositAge2 + userCDepositAge2

        const userADepositAge3 = (block6 - block5)*(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2)
        const userBDepositAge3 = (block6 - block5)*(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2)
        const userCDepositAge3 = (block6 - block5)*(amount3 + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2)
        const totalDepositAge3 = userADepositAge3 + userBDepositAge3 + userCDepositAge3

        const userADepositAge4 = (block7 - block6)*(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2 + reward3*userADepositAge3/totalDepositAge3)
        const userBDepositAge4 = (block7 - block6)*(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2 + reward3*userBDepositAge3/totalDepositAge3)
        const userCDepositAge4 = (block7 - block6)*(amount3 + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2 + reward3*userCDepositAge3/totalDepositAge3)
        const totalDepositAge4 = userADepositAge4 + userBDepositAge4 + userCDepositAge4

        beforeEach(() => {
            c.deposit(userA, amount1, block1)   // 1000, 0
            c.deposit(userB, amount2, block2)   // 300, 5
            c.deposit(userC, amount3, block3)   // 800, 20
            c.setExpectedReward(reward1, block4)
            c.distribute(reward1, block4)       // 0, 50

            c.setExpectedReward(reward2, block5)
            c.distribute(reward2, block5)       // 500, 100

            c.setExpectedReward(reward3, block6)
            c.distribute(reward3, block6)       // 1000, 151

            c.setExpectedReward(reward4, block7)
            c.distribute(reward4, block7)       // 700, 152
        })
        test('doesnt affect rewards',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2 + reward3*userADepositAge3/totalDepositAge3 + reward4*userADepositAge4/totalDepositAge4, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2 + reward3*userBDepositAge3/totalDepositAge3 + reward4*userBDepositAge4/totalDepositAge4, 1)
            expect(c.userBalance(userC)).toBeCloseTo(amount3 + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2 + reward3*userCDepositAge3/totalDepositAge3 + reward4*userCDepositAge4/totalDepositAge4, 1)
        })
        test('sum of balances is consistent',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(amount1 + amount2 + amount3 + reward1 + reward2 + reward3 + reward4, 8)
            expect(c.userBalance(userA) + c.userBalance(userB) + c.userBalance(userC)).toBeCloseTo(c.getTotalDeposits(), 8)
        })
    })
    describe('rewards distributed correctly if no distributions were made for one of the users', ()=>{
        beforeEach(() => {
            c.deposit(userA, 100, 0)
            c.setExpectedReward(100, 50)
            c.distribute(100, 50)
            c.setExpectedReward(0, 200)
            c.deposit(userB, 100, 100)
        })
        test('doesnt affect rewards',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(200, 1)
            expect(c.userBalance(userB)).toBeCloseTo(100, 1)
        })
        test('doesnt affect deposits',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(300, 8)
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
        })
    })
    describe('rewards distributed correctly if one of the users deposited on the distribution block', ()=>{
        const amount1 = 100
        const amount2 = 100
        const reward1 = 100
        const reward2 = 100

        const block1 = 0
        const block2 = 50
        const block3 = 50
        const block4 = 100

        const userADepositAge1 = (block3 - block1)*amount1 
        const userBDepositAge1 = (block3 - block2)*amount2
        const totalDepositAge1 = userADepositAge1 + userBDepositAge1

        const userADepositAge2 = (block4 - block3)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge2 = (block4 - block3)*(amount2 + reward1*userBDepositAge1/totalDepositAge1)
        const totalDepositAge2 = userADepositAge2 + userBDepositAge2
        beforeEach(() => {
            c.deposit(userA, amount1, block1)   // 100, 0
            c.setExpectedReward(reward1, block3)
            c.deposit(userB, amount2, block2)   // 100, 50
            c.distribute(reward1, block3)       // 100, 50

            c.setExpectedReward(reward2, block4)
            c.distribute(reward2, block4)
        })
        test('doesnt affect rewards',()=>{
            expect(c.userBalance(userA)).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 1)
            expect(c.userBalance(userB)).toBeCloseTo(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2, 1)
        })
        test('doesnt affect deposits',()=>{
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(amount1 + amount2 + reward1 + reward2, 8)
            expect(c.userBalance(userA) + c.userBalance(userB)).toBeCloseTo(c.getTotalDeposits(), 8)
        })
    })


    describe('sum of tokens is consistent after wrong ExpectedRewards',()=>{
        const amount1 = 500
        const amount2 = 700
        const amount3 = 200
        const reward1 = 2000

        const block1 = 20
        const block2 = 40
        const block3 = 45
        const block4 = 50

        let rewardA1 = 0
        let rewardB1 = 0
        let rewardC1 = 0
        let rewardD1 = 0
        let totalDeposits1 = 0

        const amount5 = 200
        const amount6 = 200
        const amount7 = 1000
        const reward2 = 3000

        const block5 = 60
        const block6 = 60
        const block7 = 80
        const block8 = 100

        let rewardA2 = 0
        let rewardB2 = 0
        let rewardC2 = 0
        let rewardD2 = 0
        let totalDeposits2 = 0

        beforeEach(() => {
            c.deposit(userA, amount1, block1)    // 500, 20
            c.setExpectedReward(100, 22)
            c.deposit(userB, amount2, block2)    // 700, 40
            c.setExpectedReward(200, 60)
            c.deposit(userC, amount3, block3)    // 200, 45
            c.setExpectedReward(600, 30)
            c.distribute(reward1, block4)        // 2000, 50

            rewardA1 = c.userBalance(userA)
            rewardB1 = c.userBalance(userB)
            rewardC1 = c.userBalance(userC)
            rewardD1 = c.userBalance(userD)
            totalDeposits1 = c.getTotalDeposits()

            c.setExpectedReward(700, 90)
            c.withdraw(userC, amount5, block5)  // 200, 60
            c.deposit(userC, amount6, block6)   // 200, 60
            c.setExpectedReward(600, 65)
            c.deposit(userD, amount7, block7)   // 1000, 80
            c.setExpectedReward(1000, 120)
            c.distribute(reward2, block8)    // 3000, 100

            rewardA2 = c.userBalance(userA)
            rewardB2 = c.userBalance(userB)
            rewardC2 = c.userBalance(userC)
            rewardD2 = c.userBalance(userD)
            totalDeposits2 = c.getTotalDeposits()

        })
        test('sum of rewards after the first distribution is consistent',()=>{
            expect(rewardA1 + rewardB1 + rewardC1 + rewardD1).toBeCloseTo(totalDeposits1, 8)
            expect(rewardA1 + rewardB1 + rewardC1 + rewardD1).toBeCloseTo(amount1 + amount2 + amount3 + reward1, 8)
        })
        test('sum of rewards after the second distribution is consistent',()=>{
            expect(rewardA2 + rewardB2 + rewardC2 + rewardD2).toBeCloseTo(totalDeposits2, 8)
            expect(rewardA2 + rewardB2 + rewardC2 + rewardD2).toBeCloseTo(amount1 + amount2 + amount3 + reward1 - amount5 + amount6 + amount7 + reward2, 8)
        })
    })
    describe('sum of tokens is consistent after wrong ExpectedRewards',()=>{
        const amount1 = 500
        const amount2 = 700
        const reward = 2000
        const block1 = 20
        const block2 = 40
        const block3 = 45
    
        let stakeA = 0
        let stakeB = 0
        let totalDeposits = 0
    
        beforeEach(() => {
            c.deposit(userA, amount1, block1)    
            c.setExpectedReward(100, 22)
            c.deposit(userB, amount2, block2)    
            c.setExpectedReward(200, 60)
            c.distribute(reward, block3)        
            stakeA = c.userBalance(userA)
            stakeB = c.userBalance(userB)
            totalDeposits = c.getTotalDeposits()
        })
        test('sum of rewards after the first distribution is consistent',()=>{
            expect(stakeA + stakeB).toBeCloseTo(totalDeposits, 8)
            expect(stakeA + stakeB).toBeCloseTo(amount1 + amount2 + reward, 8)
        })
        test('user stakes are positive',()=>{
            const stakeAIsPositive = (stakeA >= 0)
            const stakeBIsPositive = (stakeB >= 0)
            expect(stakeAIsPositive).toBe(true, 8)
            expect(stakeBIsPositive).toBe(true, 8)
        })
    })
    describe('deposits after distribution doesnt affect existing stakes',()=>{
        const amount1 = 500
        const amount2 = 700
        const reward = 2000
        const amount4 = 200
        const block1 = 20
        const block2 = 40
        const block3 = 45
        const block4 = 50
    
        let stakeA = 0
        let stakeB = 0
        let totalDeposits = 0

        let stakeA1 = 0
        let stakeB1 = 0
        let totalDeposits1 = 0
    
        beforeEach(() => {
            c.deposit(userA, amount1, block1)    
            c.setExpectedReward(reward, block3)
            c.deposit(userB, amount2, block2)    
            c.distribute(reward, block3)        
            stakeA = c.userBalance(userA)
            stakeB = c.userBalance(userB)
            totalDeposits = c.getTotalDeposits()
            c.deposit(userA, amount4, block4)    
            stakeA1 = c.userBalance(userA)
            stakeB1 = c.userBalance(userB)
            totalDeposits1 = c.getTotalDeposits()
        })
        test('sum of rewards after the first distribution is consistent',()=>{
            expect(stakeA + stakeB).toBeCloseTo(totalDeposits, 8)
            expect(stakeA + stakeB).toBeCloseTo(amount1 + amount2 + reward, 8)
        })
        test('userB stakes are consistent',()=>{
            expect(stakeB).toBeCloseTo(stakeB1, 8)
        })
        test('stakes are consistent',()=>{
            expect(stakeA1+stakeB1).toBeCloseTo(totalDeposits1, 8)
        })
    })
        
})
