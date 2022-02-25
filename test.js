const Contract = require('./contract.js');

const userA = 'A'
const userB = 'B'
const userC = 'C'
const userD = 'D'
const userE = 'E'

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

        expect(contract.userBalance(userA)).toBeCloseTo(amount1 + amount4, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 + amount5, 8)
        expect(contract.userBalance(userC)).toBeCloseTo(amount3 + amount6, 8)
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
    test('distributes tokens equaly if invested on the same block', ()=>{
        const amount1 = 1000
        const amount2 = 1000

        const block1 = 0
        const block2 = 0
        const block3 = 100

        const reward = 1000


        contract.setExpectedReward(reward, block3)
        contract.deposit(userA, amount1, block1, true)
        contract.deposit(userB, amount2, block2, true)
        contract.distribute(reward, block3)

        const totalDepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2)
        const userADepositAge = (block3 - block1)*amount1
        const userBDepositAge = (block3 - block2)*amount2

        expect(contract.userBalance(userA)).toBeCloseTo(amount1 + reward*userADepositAge/totalDepositAge, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 8)
    })

    test('distributes tokens proportionally if invested on the same block', () => {
        const amount1 = 1000
        const amount2 = 500

        const block1 = 0
        const block2 = 0
        const block3 = 100

        const reward = 1000

        contract.setExpectedReward(reward, block3)
        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)
        contract.distribute(reward, block3)

        const totalDepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2)
        const userADepositAge = (block3 - block1)*amount1
        const userBDepositAge = (block3 - block2)*amount2

        expect(contract.userBalance(userA)).toBeCloseTo(amount1 + reward*userADepositAge/totalDepositAge, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 8)
    })

    test('distributes tokens proportionally if invested on different blocks',()=>{
        const amount1 = 1000
        const amount2 = 1000

        const block1 = 0
        const block2 = 25
        const block3 = 50

        const reward = 3000

        contract.setExpectedReward(reward, block3)
        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)
        contract.distribute(reward, block3)

        const totalDepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2)
        const userADepositAge = (block3 - block1)*amount1
        const userBDepositAge = (block3 - block2)*amount2

        expect(contract.userBalance(userA)).toBeCloseTo(amount1 + reward*userADepositAge/totalDepositAge, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 8)
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
        contract.setExpectedReward(reward, block4)
        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)
        contract.deposit(userA, amount3, block3)

        contract.distribute(reward, block4)

        const totalDepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2) + (block4 - block3)*(amount1 + amount2 + amount3)
        const userADepositAge = (block3 - block1)*amount1 + (block4 - block3)*(amount1 + amount3)
        const userBDepositAge = (block4 - block2)*amount2

        expect(contract.userBalance(userA)).toBeCloseTo(amount1 + amount3 + reward*userADepositAge/totalDepositAge, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 8)
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

        const totalDepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2) + (block4 - block3)*(amount1 + amount2 + amount3)
        const userADepositAge = (block3 - block1)*amount1 + (block4 - block3)*(amount1 + amount3)
        const userBDepositAge = (block4 - block2)*amount2

        beforeEach(() => {
            contract.setExpectedReward(reward, block4)
            //deposit 1000 tokens at the same time for both users
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            //deposit 1 token right before the distribution
            contract.deposit(userA, amount3, block3)
            contract.distribute(reward, block4)
        })

        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 + amount3 + reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 8)
        })
    })
    describe('rewards distributed correctly after withdrawal with multiple deposits on the same block',()=>{
        const amount1 = 1000
        const amount2 = 1000
        const amount3 = 1
        const reward = 1000

        const block1 = 0
        const block2 = 0
        const block3 = 100
        const block4 = 100

        const totalDepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2) + (block4 - block3)*(amount1 + amount2 - amount3)
        const userADepositAge = (block3 - block1)*amount1 + (block4 - block3)*(amount1 - amount3)
        const userBDepositAge = (block4 - block2)*amount2
        beforeEach(() => {
            contract.setExpectedReward(reward, block4)
            //deposit 1000 tokens at the same time for both users
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            //withdraw 1 token right before the distribution
            contract.withdraw(userA, amount3, block3)
            contract.distribute(reward, block4)
        })

        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 - amount3 + reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 8)
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

        const totalDepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2) + (block4 - block3)*(amount1 + amount2 - amount3)
        const userADepositAge = (block4 - block1)*amount1 
        const userBDepositAge = (block3 - block2)*amount2 + (block4 - block3)*(amount2 - amount3)
        beforeEach(() => {
            contract.setExpectedReward(reward, block4)
            //deposit same amount on different blocks
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            //withdraw 1 token right before the distribution
            contract.withdraw(userB, amount3, block3)
            contract.distribute(reward, block4)
        })

        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 + reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 - amount3 + reward*userBDepositAge/totalDepositAge, 8)
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

        const totalDepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 - amount2) + (block4 - block3)*(amount1 - amount2 + amount3) + (block5 - block4)*(amount1 - amount2 + amount3 + amount4)
        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 - amount2) + (block5 - block3)*(amount1 - amount2 + amount3)
        const userBDepositAge = (block5 - block4)*amount4
        beforeEach(() => {
            contract.setExpectedReward(reward, block5)
            contract.deposit(userA, amount1, block1)
            contract.withdraw(userA, amount2, block2)

            contract.deposit(userA, amount3, block3)
            contract.deposit(userB, amount4, block4)
            contract.distribute(reward, block5)
        })

        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 - amount2 + amount3 + reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount4 + reward*userBDepositAge/totalDepositAge, 8)
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

        const totalDepositAge = 
            (block2 - block1)*amount1 + 
            (block3 - block2)*(amount1 + amount2) + 
            (block4 - block3)*(amount1 + amount2 - amount3) + 
            (block5 - block4)*(amount1 + amount2 - amount3 - amount4) +
            (block6 - block5)*(amount1 + amount2 - amount3 - amount4 - amount5) + 
            (block7 - block6)*(amount1 + amount2 - amount3 - amount4 - amount5 + amount6) + 
            (block8 - block7)*(amount1 + amount2 - amount3 - amount4 - amount5 + amount6 + amount7) 

        const userADepositAge = (block4 - block1)*amount1 + (block7 - block4)*(amount1 - amount4) + (block8 - block7)*(amount1 - amount4 + amount7)
        const userBDepositAge = (block3 - block2)*amount2 + (block5 - block3)*(amount2 - amount3) + (block6 - block5)*(amount2 - amount3 - amount5) + (block8 - block6)*(amount2 - amount3 - amount5 + amount6)
        beforeEach(() => {
            contract.setExpectedReward(reward, block8)
            //make random actions to set variables
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.withdraw(userB, amount3,block3)

            //withdraw all tokens
            contract.withdraw(userA, amount4, block4)
            contract.withdraw(userB, amount5, block5)

            //deposit 1000 for each user
            contract.deposit(userB, amount6, block6)
            contract.deposit(userA, amount7, block7)
            contract.distribute(reward, block8)
        })


        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 - amount4 + amount7 + reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 - amount3 - amount5 + amount6 + reward*userBDepositAge/totalDepositAge, 8)
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

        const totalDepositAge1 = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2) + (block4 - block3)*(amount1 + amount2 + amount3)
        const userADepositAge1 = (block4 - block1)*amount1
        const userBDepositAge1 = (block4 - block2)*amount2 
        const userCDepositAge1 = (block4 - block3)*amount3
        let rewardA1 = 0
        let rewardB1 = 0
        let rewardC1 = 0
        let rewardD1 = 0

        const amount5 = 200
        const amount6 = 200
        const amount7 = 1000
        const reward2 = 3000

        const block5 = 60
        const block6 = 60
        const block7 = 80
        const block8 = 100
        const totalDepositAge2 =
            (block5 - block4)*(amount1 + amount2 + amount3 + reward1) + 
            (block6 - block5)*(amount1 + amount2 + amount3 + reward1 - amount5) +
            (block7 - block6)*(amount1 + amount2 + amount3 + reward1 - amount5 + amount6) +
            (block8 - block7)*(amount1 + amount2 + amount3 + reward1 - amount5 + amount6  + amount7)
        let userADepositAge2 = (block8 - block4)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        let userBDepositAge2 = (block8 - block4)*(amount2 + reward1*userBDepositAge1/totalDepositAge1)
        let userCDepositAge2 = (block5 - block4)*(amount3 + reward1*userCDepositAge1/totalDepositAge1) + (block6 - block5)*(amount3 + reward1*userCDepositAge1/totalDepositAge1 - amount5) + (block8 - block6)*(amount3 + reward1*userCDepositAge1/totalDepositAge1 - amount5 + amount6)
        let userDDepositAge2 = (block8 - block7)*amount7

        let rewardA2 = 0
        let rewardB2 = 0
        let rewardC2 = 0
        let rewardD2 = 0

        beforeEach(() => {
            contract.setExpectedReward(reward1, block4)
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.deposit(userC, amount3, block3)
            contract.distribute(reward1, block4)
                rewardA1 = contract.userBalance(userA)
                rewardB1 = contract.userBalance(userB)
                rewardC1 = contract.userBalance(userC)
                rewardD1 = contract.userBalance(userD)

            contract.setExpectedReward(reward2, block8)
            contract.withdraw(userC, amount5, block5)
            contract.deposit(userC, amount6, block6) 
            contract.deposit(userD, amount7, block7)
            contract.distribute(reward2, block8)
                rewardA2 = contract.userBalance(userA)
                rewardB2 = contract.userBalance(userB)
                rewardC2 = contract.userBalance(userC)
                rewardD2 = contract.userBalance(userD)

        })
        test('rewards after the first distribution are correct',()=>{
            expect(rewardA1).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1, 8)
            expect(rewardB1).toBeCloseTo(amount2 + reward1*userBDepositAge1/totalDepositAge1, 8)
            expect(rewardC1).toBeCloseTo(amount3 + reward1*userCDepositAge1/totalDepositAge1, 8)
            expect(rewardD1).toBeCloseTo(0, 8)
        })
        test('sum of rewards after the first distribution is consistent',()=>{
            expect(rewardA1 + rewardB1 + rewardC1 + rewardD1).toBeCloseTo(contract.getTotalDeposits(), 8)
        })

        test('rewards after the second distribution are correct',()=>{
            expect(rewardA2).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(rewardB2).toBeCloseTo(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2, 8)
            expect(rewardC2).toBeCloseTo(amount3 - amount5 + amount6 + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2, 8)
            expect(rewardD2).toBeCloseTo(amount7 + reward2*userDDepositAge2/totalDepositAge2, 8)
        })
        test('sum of rewards after the second distribution is consistent',()=>{
            expect(rewardA2 + rewardB2 + rewardC2 + rewardD2).toBeCloseTo(reward2 + reward1, 8)
        })
    })

    test('rewards distributed correctly after some tokens were withdrawn by user mid strat',()=>{
        contract.setExpectedReward(1000, 50)
        contract.deposit(userA, 500, 0)
        contract.withdraw(userA, 300, 20)
        contract.distribute(1000, 50)

        expect(contract.userBalance(userA)).toBeCloseTo(1200, 8)
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
        contract.setExpectedReward(reward, block8)
        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)
        contract.withdraw(userA, amount3, block3)

        contract.withdraw(userA, amount4, block4)
        contract.deposit(userA, amount5, block5)

        contract.withdraw(userA, amount6, block6)
        contract.deposit(userA, amount7, block7)

        contract.distribute(reward, block8) 

        const totalDepositAge = 
            (block2 - block1)*amount1 +
            (block3 - block2)*(amount1 + amount2) +
            (block4 - block3)*(amount1 + amount2 - amount3) +
            (block5 - block4)*(amount1 + amount2 - amount3 - amount4) +
            (block6 - block5)*(amount1 + amount2 - amount3 - amount4 + amount5) +
            (block7 - block6)*(amount1 + amount2 - amount3 - amount4 + amount5 - amount6) +
            (block8 - block7)*(amount1 + amount2 - amount3 - amount4 + amount5 - amount6 + amount7) 
        const userADepositAge = 
            (block3 - block1)*amount1 + 
            (block4 - block3)*(amount1 - amount3) + 
            (block5 - block4)*(amount1 - amount3 - amount4) + 
            (block6 - block5)*(amount1 - amount3 - amount4 + amount5) + 
            (block7 - block6)*(amount1 - amount3 - amount4 + amount5 - amount6) + 
            (block8 - block7)*(amount1 - amount3 - amount4 + amount5 - amount6 + amount7)
        const userBDepositAge = (block8 - block2)*amount2

        expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(contract.getTotalDeposits(), 8)
        expect(contract.userBalance(userA)).toBeCloseTo(amount1 - amount3 - amount4 + amount5 - amount6 + amount7 + reward*userADepositAge/totalDepositAge, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 8)
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

        const totalDepositAge = 
            (block2 - block1)*amount1 +
            (block3 - block2)*(amount1 + amount2) +
            (block4 - block3)*(amount1 + amount2 + amount3) +
            (block5 - block4)*(amount1 + amount2 + amount3 - amount4) +
            (block6 - block5)*(amount1 + amount2 + amount3 - amount4 + amount5) +
            (block7 - block6)*(amount1 + amount2 + amount3 - amount4 + amount5 - amount6) +
            (block8 - block7)*(amount1 + amount2 + amount3 - amount4 + amount5 - amount6 + amount7) +
            (block9 - block8)*(amount1 + amount2 + amount3 - amount4 + amount5 - amount6 + amount7 - amount8)

        const userADepositAge = 
            (block4 - block1)*amount1 + 
            (block5 - block4)*(amount1 - amount4) + 
            (block8 - block5)*(amount1 - amount4 + amount5) +
            (block9 - block8)*(amount1 - amount4 + amount5 - amount8) 
        const userBDepositAge = (block9 - block2)*amount2
        const userCDepositAge = (block6 - block3)*amount3 + (block7 - block6)*(amount3 - amount6) + (block9 - block7)*(amount3 - amount6 + amount7)

        beforeEach(() => {
            contract.setExpectedReward(reward, block9)
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.deposit(userC, amount3, block3)

            contract.withdraw(userA, amount4, block4)
            contract.deposit(userA, amount5, block5)

            contract.withdraw(userC, amount6, block6)
            contract.deposit(userC, amount7, block7)

            contract.withdraw(userA, amount8, block8)
            contract.distribute(reward, block9)
        })

        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 - amount4 + amount5 - amount8 + reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 8)
            expect(contract.userBalance(userC)).toBeCloseTo(amount3 - amount6 + amount7 + reward*userCDepositAge/totalDepositAge, 8)
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

        const totalDepositAge1 = 
            (block2 - block1)*amount1 +
            (block3 - block2)*(amount1 + amount2) +
            (block4 - block3)*(amount1 + amount2 + amount3) +
            (block5 - block4)*(amount1 + amount2 + amount3 - amount4) +
            (block6 - block5)*(amount1 + amount2 + amount3 - amount4 + amount5) +
            (block7 - block6)*(amount1 + amount2 + amount3 - amount4 + amount5 - amount6) +
            (block8 - block7)*(amount1 + amount2 + amount3 - amount4 + amount5 - amount6 + amount7) +
            (block9 - block8)*(amount1 + amount2 + amount3 - amount4 + amount5 - amount6 + amount7 - amount8) 
        const totalDepositAge2 = 
            (block10 - block9)*(amount1 + amount2 + amount3 - amount4 + amount5 - amount6 + amount7 - amount8 + reward1) +
            (block11 - block10)*(amount1 + amount2 + amount3 - amount4 + amount5 - amount6 + amount7 - amount8 + reward1 + amount10) +
            (block12 - block11)*(amount1 + amount2 + amount3 - amount4 + amount5 - amount6 + amount7 - amount8 + reward1 + amount10 + amount11)

        const userADepositAge1 = 
            (block4 - block1)*amount1 + 
            (block5 - block4)*(amount1 - amount4) + 
            (block8 - block5)*(amount1 - amount4 + amount5) +
            (block9 - block8)*(amount1 - amount4 + amount5 - amount8) 
        const userBDepositAge1 = (block9 - block2)*amount2
        const userCDepositAge1 = (block6 - block3)*amount3 + (block7 - block6)*(amount3 - amount6) + (block9 - block7)*(amount3 - amount6 + amount7)

        const userADepositAge2 = (block12 - block9)*(amount1 - amount4 + amount5 - amount8 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge2 = (block11 - block9)*(amount2 + reward1*userBDepositAge1/totalDepositAge1) + (block12 - block11)*(amount2 + amount11 + reward1*userBDepositAge1/totalDepositAge1)
        const userCDepositAge2 = (block12 - block9)*(amount3 - amount6 + amount7 + reward1*userCDepositAge1/totalDepositAge1)
        const userDDepositAge2 = (block12 - block10)*amount10 

        beforeEach(() => {
            contract.setExpectedReward(reward1, block9)
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.deposit(userC, amount3, block3)
            contract.withdraw(userA, amount4, block4)
            contract.deposit(userA, amount5, block5)
            contract.withdraw(userC, amount6, block6)
            contract.deposit(userC, amount7, block7)
            contract.withdraw(userA, amount8, block8)
            contract.distribute(reward1, block9)

            contract.setExpectedReward(reward2, block12)
            contract.deposit(userD, amount10, block10)
            contract.deposit(userB, amount11, block11)
            contract.distribute(reward2, block12)
        })
        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC) + contract.userBalance(userD)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 - amount4 + amount5 - amount8 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 + amount11 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2, 8)
            expect(contract.userBalance(userC)).toBeCloseTo(amount3 - userC + userC + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2, 8)
            expect(contract.userBalance(userD)).toBeCloseTo(amount10 + reward2*userDDepositAge2/totalDepositAge2, 8)
        })
    })
    describe('rewards distributed correctly with redeposit',()=>{
        const amount1 = 1000
        const reward1 = 1000
        const amount3 = 1000
        const reward2 = 1000

        const block1 = 0
        const block2 = 50
        const block3 = 50
        const block4 = 100

        const totalDepositAge1 = (block2 - block1)*amount1 
        const totalDepositAge2 =  (block3 - block2)*(amount1 + reward1) + (block4 - block3)*(amount1 + reward1 + amount3)
        const userADepositAge1 = (block2 - block1)*amount1 
        const userADepositAge2 =  (block4 - block2)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge = (block4 - block3)*amount3

        beforeEach(() => {
            contract.setExpectedReward(reward1, block2)
            contract.deposit(userA, amount1, block1)
            contract.distribute(reward1, block2)

            contract.setExpectedReward(reward2, block4)
            contract.deposit(userB, amount3, block3)
            contract.distribute(reward2, block4)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount3 + reward2*userBDepositAge/totalDepositAge2, 8)
        })

        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(contract.getTotalDeposits(), 8)
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

        const totalDepositAge1 = (block2 - block1)*amount1 
        const totalDepositAge2 =  (block3 - block2)*(amount1 + reward1) + (block4 - block3)*(amount1 + reward1 + amount3)
        const userADepositAge1 = (block2 - block1)*amount1 
        const userADepositAge2 =  (block4 - block2)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge = (block4 - block3)*amount3

        beforeEach(() => {
            contract.setExpectedReward(reward1, block2)
            contract.deposit(userA, amount1, block1)
            contract.distribute(reward1, block2)

            contract.setExpectedReward(reward2, block4)
            contract.deposit(userB, amount3, block3)
            contract.distribute(reward2, block4)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount3 + reward2*userBDepositAge/totalDepositAge2, 8)
        })

        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
    })
    describe('rewards distributed correctly after multiple distributions for one user',()=>{
        beforeEach(() => {
            contract.setExpectedReward(0, 50)
            contract.deposit(userA, 1000, 0)
            contract.distribute(0, 50)

            contract.setExpectedReward(1000, 100)
            contract.distribute(1000, 100)

            contract.setExpectedReward(1000, 151)
            contract.distribute(1000, 151)

            contract.setExpectedReward(1000, 152)
            contract.distribute(1000, 152)

            contract.setExpectedReward(1000, 153)
            contract.distribute(1000, 153)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(5000, 8)
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

        const totalDepositAge1 = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2) + (block4 - block3)*(amount1 + amount2 + amount3)
        const totalDepositAge2 = (block5 - block4)*(amount1 + amount2 + amount3 + reward1)
        const totalDepositAge3 = (block6 - block5)*(amount1 + amount2 + amount3 + reward1 + reward2)
        const totalDepositAge4 = (block7 - block6)*(amount1 + amount2 + amount3 + reward1 + reward2 + reward3)

        const userADepositAge1 = (block4 - block1)*amount1 
        const userADepositAge2 = (block5 - block4)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        const userADepositAge3 = (block6 - block5)*(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2)
        const userADepositAge4 = (block7 - block6)*(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2 + reward3*userADepositAge3/totalDepositAge3)

        const userBDepositAge1 = (block4 - block2)*amount2
        const userBDepositAge2 = (block5 - block4)*(amount2 + reward1*userBDepositAge1/totalDepositAge1)
        const userBDepositAge3 = (block6 - block5)*(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2)
        const userBDepositAge4 = (block7 - block6)*(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2 + reward3*userBDepositAge3/totalDepositAge3)

        const userCDepositAge1 = (block4 - block3)*amount3
        const userCDepositAge2 = (block5 - block4)*(amount3 + reward1*userCDepositAge1/totalDepositAge1)
        const userCDepositAge3 = (block6 - block5)*(amount3 + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2)
        const userCDepositAge4 = (block7 - block6)*(amount3 + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2 + reward3*userCDepositAge3/totalDepositAge3)

        beforeEach(() => {
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.deposit(userC, amount3, block3)

            contract.setExpectedReward(reward1, block4)
            contract.distribute(reward1, block4)

            contract.setExpectedReward(reward2, block5)
            contract.distribute(reward2, block5)

            contract.setExpectedReward(reward3, block6)
            contract.distribute(reward3, block6)

            contract.setExpectedReward(reward4, block7)
            contract.distribute(reward4, block7)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2 + reward3*userADepositAge3/totalDepositAge3 + reward4*userADepositAge4/totalDepositAge4, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2 + reward3*userBDepositAge3/totalDepositAge3 + reward4*userBDepositAge4/totalDepositAge4, 8)
            expect(contract.userBalance(userC)).toBeCloseTo(amount3 + reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2 + reward3*userCDepositAge3/totalDepositAge3 + reward4*userCDepositAge4/totalDepositAge4, 8)
        })
        test('sum of balances is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC)).toBeCloseTo(amount1 + amount2 + amount3 + reward1 + reward2 + reward3 + reward4, 8)
        })
    })
    describe('rewards distributed correctly if no distributions were made for one of the users', ()=>{
        beforeEach(() => {
            contract.setExpectedReward(100, 50)
            contract.deposit(userA, 100, 0)
            contract.distribute(100, 50)
            contract.deposit(userB, 100, 100)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(200, 8)
            expect(contract.userBalance(userB)).toBe(100, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(300, 8)
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

        const totalDepositAge1 = (block2 - block1)*amount1 + (block3 - block2)*(amount1 + amount2) 
        const totalDepositAge2 = (block4 - block3)*(amount1 + amount2 + reward1)

        const userADepositAge1 = (block3 - block1)*amount1 
        const userADepositAge2 = (block4 - block3)*(amount1 + reward1*userADepositAge1/totalDepositAge1)
        const userBDepositAge1 = (block3 - block2)*amount2
        const userBDepositAge2 = (block4 - block3)*(amount2 + reward1*userBDepositAge1/totalDepositAge1)
        beforeEach(() => {
            contract.setExpectedReward(reward1, block3)
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.distribute(reward1, block3)

            contract.setExpectedReward(reward2, block4)
            contract.distribute(reward2, block4)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userBalance(userA)).toBeCloseTo(amount1 + reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(amount1 + amount2 + reward1 + reward2, 8)
        })
    })
})
