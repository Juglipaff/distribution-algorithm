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

        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)
        contract.distribute(reward, block3)

        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*amount1
        const userBDepositAge = (block2 - block1)*0 + (block3 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        expect(contract.userBalance(userA)).toBeCloseTo(amount1 + reward*userADepositAge/totalDepositAge, 8)
        expect(contract.userBalance(userB)).toBeCloseTo(amount2 + reward*userBDepositAge/totalDepositAge, 8)
    })

    test('distributes tokens proportionally if invested on the same block', ()=>{
        const amount1 = 1000
        const amount2 = 500

        const block1 = 0
        const block2 = 0
        const block3 = 100

        const reward = 1000

        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)
        contract.distribute(reward, block3)

        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*amount1
        const userBDepositAge = (block2 - block1)*0 + (block3 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

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

        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)
        contract.distribute(reward, block3)

        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*amount1
        const userBDepositAge = (block2 - block1)*0 + (block3 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

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
        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)
        contract.deposit(userA, amount3, block3)

        contract.distribute(reward, block4)

        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*amount1 + (block4 - block3)*(amount1 + amount3)
        const userBDepositAge = (block2 - block1)*0 + (block3 - block2)*amount2 + (block4 - block3)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge


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

        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*amount1 + (block4 - block3)*(amount1 + amount3)
        const userBDepositAge = (block2 - block1)*0 + (block3 - block2)*amount2 + (block4 - block3)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        beforeEach(() => {
            //deposit 1000 tokens at the same time for both users
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            //deposit 1 token right before the distribution
            contract.deposit(userA, amount3, block3)
            contract.distribute(reward, block4)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward*userBDepositAge/totalDepositAge, 8)
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

        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*amount1 + (block4 - block3)*(amount1 - amount3)
        const userBDepositAge = (block2 - block1)*0 + (block3 - block2)*amount2 + (block4 - block3)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        beforeEach(() => {
            //deposit 1000 tokens at the same time for both users
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            //withdraw 1 token right before the distribution
            contract.withdraw(userA, amount3, block3)
            contract.distribute(reward, block4)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward*userBDepositAge/totalDepositAge, 8)
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


        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*amount1 + (block4 - block3)*amount1
        const userBDepositAge = (block2 - block1)*0 + (block3 - block2)*amount2 + (block4 - block3)*(amount2 - amount3)
        const totalDepositAge = userADepositAge + userBDepositAge

        beforeEach(() => {
            //deposit same amount on different blocks
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            //withdraw 1 token right before the distribution
            contract.withdraw(userB, amount3, block3)
            contract.distribute(reward, block4)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward*userBDepositAge/totalDepositAge, 8)
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

        
        const userADepositAge = (block2 - block1)*amount1 + (block3 - block2)*(amount1 - amount2) + (block4 - block3)*(amount1 - amount2 + amount3) + (block5 - block4)*(amount1 - amount2 + amount3)
        const userBDepositAge = (block2 - block1)*0 + (block3 - block2)*0 + (block4 - block3)*0 + (block5 - block4)*amount4
        const totalDepositAge = userADepositAge + userBDepositAge

        beforeEach(() => {
            contract.deposit(userA, amount1, block1)
            contract.withdraw(userA, amount2, block2)

            contract.deposit(userA, amount3, block3)
            contract.deposit(userB, amount4, block4)
            contract.distribute(reward, block5)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward*userBDepositAge/totalDepositAge, 8)
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


        const userADepositAge = (block4 - block1)*amount1 + (block7 - block4)*(amount1 - amount4) + (block8 - block7)*(amount1 - amount4 + amount7)
        const userBDepositAge = (block3 - block2)*amount2 + (block5 - block3)*(amount2 - amount3) + (block6 - block5)*(amount2 - amount3 - amount5) + (block8 - block6)*(amount2 - amount3 - amount5 + amount6)
        const totalDepositAge = userADepositAge + userBDepositAge
        beforeEach(() => {
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

        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward*userBDepositAge/totalDepositAge, 8)
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

        const userADepositAge1 = (block4 - block1)*amount1
        const userBDepositAge1 = (block4 - block2)*amount2 
        const userCDepositAge1 = (block4 - block3)*amount3
        const totalDepositAge1 = userADepositAge1 + userBDepositAge1 + userCDepositAge1
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
        let userADepositAge2 = (block8 - block4)*(amount1)
        let userBDepositAge2 = (block8 - block4)*(amount2)
        let userCDepositAge2 = (block5 - block4)*(amount3) + (block6 - block5)*(amount3 - amount5) + (block8 - block6)*(amount3 - amount5 + amount6)
        let userDDepositAge2 = (block8 - block7)*amount7
        const totalDepositAge2 = userADepositAge2 + userBDepositAge2 + userCDepositAge2 + userDDepositAge2

        let rewardA2 = 0
        let rewardB2 = 0
        let rewardC2 = 0
        let rewardD2 = 0

        beforeEach(() => {
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.deposit(userC, amount3, block3)
            contract.distribute(reward1, block4)
                rewardA1 = contract.userReward(userA)
                rewardB1 = contract.userReward(userB)
                rewardC1 = contract.userReward(userC)
                rewardD1 = contract.userReward(userD)

            contract.withdraw(userC, amount5, block5)
            contract.deposit(userC, amount6, block6) 
            contract.deposit(userD, amount7, block7)
            contract.distribute(reward2, block8)
                rewardA2 = contract.userReward(userA)
                rewardB2 = contract.userReward(userB)
                rewardC2 = contract.userReward(userC)
                rewardD2 = contract.userReward(userD)

        })
        test('rewards after the first distribution are correct',()=>{
            expect(rewardA1).toBeCloseTo(reward1*userADepositAge1/totalDepositAge1, 8)
            expect(rewardB1).toBeCloseTo(reward1*userBDepositAge1/totalDepositAge1, 8)
            expect(rewardC1).toBeCloseTo(reward1*userCDepositAge1/totalDepositAge1, 8)
            expect(rewardD1).toBeCloseTo(0, 8)
        })
        test('sum of rewards after the first distribution is consistent',()=>{
            expect(rewardA1 + rewardB1 + rewardC1 + rewardD1).toBeCloseTo(reward1, 8)
        })

        test('rewards after the second distribution are correct',()=>{
            expect(rewardA2).toBeCloseTo(reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(rewardB2).toBeCloseTo(reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2, 8)
            expect(rewardC2).toBeCloseTo(reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2, 8)
            expect(rewardD2).toBeCloseTo(reward2*userDDepositAge2/totalDepositAge2, 8)
        })
        test('sum of rewards after the second distribution is consistent',()=>{
            expect(rewardA2 + rewardB2 + rewardC2 + rewardD2).toBeCloseTo(reward2+reward1, 8)
        })
    })

    test('rewards distributed correctly after some tokens were withdrawn by user mid strat',()=>{
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
        contract.deposit(userA, amount1, block1)
        contract.deposit(userB, amount2, block2)
        contract.withdraw(userA, amount3, block3)

        contract.withdraw(userA, amount4, block4)
        contract.deposit(userA, amount5, block5)

        contract.withdraw(userA, amount6, block6)
        contract.deposit(userA, amount7, block7)

        contract.distribute(reward, block8) 

        const userADepositAge = 
            (block3 - block1)*amount1 + 
            (block4 - block3)*(amount1 - amount3) + 
            (block5 - block4)*(amount1 - amount3 - amount4) + 
            (block6 - block5)*(amount1 - amount3 - amount4 + amount5) + 
            (block7 - block6)*(amount1 - amount3 - amount4 + amount5 - amount6) + 
            (block8 - block7)*(amount1 - amount3 - amount4 + amount5 - amount6 + amount7)
        const userBDepositAge = (block8 - block2)*amount2
        const totalDepositAge = userADepositAge + userBDepositAge

        expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward, 8)
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

        const userADepositAge = 
            (block4 - block1)*amount1 + 
            (block5 - block4)*(amount1 - amount4) + 
            (block8 - block5)*(amount1 - amount4 + amount5) +
            (block9 - block8)*(amount1 - amount4 + amount5 - amount8) 
        const userBDepositAge = (block9 - block2)*amount2
        const userCDepositAge = (block6 - block3)*amount3 + (block7 - block6)*(amount3 - amount6) + (block9 - block7)*(amount3 - amount6 + amount7)
        const totalDepositAge = userADepositAge + userBDepositAge + userCDepositAge

        beforeEach(() => {
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
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)+ contract.userReward(userC)).toBeCloseTo(reward, 8)
        })
        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward*userADepositAge/totalDepositAge, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward*userBDepositAge/totalDepositAge, 8)
            expect(contract.userReward(userC)).toBeCloseTo(reward*userCDepositAge/totalDepositAge, 8)
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

        const userADepositAge1 = 
            (block4 - block1)*amount1 + 
            (block5 - block4)*(amount1 - amount4) + 
            (block8 - block5)*(amount1 - amount4 + amount5) +
            (block9 - block8)*(amount1 - amount4 + amount5 - amount8) 
        const userBDepositAge1 = (block9 - block2)*amount2
        const userCDepositAge1 = (block6 - block3)*amount3 + (block7 - block6)*(amount3 - amount6) + (block9 - block7)*(amount3 - amount6 + amount7)
        const totalDepositAge1 = userADepositAge1 + userBDepositAge1 + userCDepositAge1

        const userADepositAge2 = (block12 - block9)*(amount1 - amount4 + amount5 - amount8)
        const userBDepositAge2 = (block11 - block9)*amount2 + (block12 - block11)*(amount2 + amount11)
        const userCDepositAge2 = (block12 - block9)*(amount3 - amount6 + amount7)
        const userDDepositAge2 = (block12 - block10)*amount10 
        const totalDepositAge2 = userADepositAge2 + userBDepositAge2 + userCDepositAge2 + userDDepositAge2

        beforeEach(() => {
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.deposit(userC, amount3, block3)
            contract.withdraw(userA, amount4, block4)
            contract.deposit(userA, amount5, block5)
            contract.withdraw(userC, amount6, block6)
            contract.deposit(userC, amount7, block7)
            contract.withdraw(userA, amount8, block8)
            contract.distribute(reward1, block9)

            contract.deposit(userD, amount10, block10)
            contract.deposit(userB, amount11, block11)
            contract.distribute(reward2, block12)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB) + contract.userReward(userC) + contract.userReward(userD)).toBeCloseTo(reward1 + reward2, 8)
        })
        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC) + contract.userBalance(userD)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2, 8)
            expect(contract.userReward(userC)).toBeCloseTo(reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2, 8)
            expect(contract.userReward(userD)).toBeCloseTo(reward2*userDDepositAge2/totalDepositAge2, 8)
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

        const userADepositAge1 = (block2 - block1)*amount1 
        const totalDepositAge1 = userADepositAge1

        const userADepositAge2 =  (block4 - block2)*amount1
        const userBDepositAge = (block4 - block3)*amount3
        const totalDepositAge2 = userADepositAge2 + userBDepositAge

        beforeEach(() => {
            contract.deposit(userA, amount1, block1)
            contract.distribute(reward1, block2)

            contract.deposit(userB, amount3, block3)
            contract.distribute(reward2, block4)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward2*userBDepositAge/totalDepositAge2, 8)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward1 + reward2, 8)
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

        const userADepositAge1 = (block2 - block1)*amount1 
        const totalDepositAge1 = userADepositAge1

        const userADepositAge2 = (block4 - block2)*amount1
        const userBDepositAge = (block4 - block3)*amount3
        const totalDepositAge2 = userADepositAge2 + userBDepositAge

        beforeEach(() => {
            contract.deposit(userA, amount1, block1)
            contract.distribute(reward1, block2)

            contract.deposit(userB, amount3, block3)
            contract.distribute(reward2, block4)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward2*userBDepositAge/totalDepositAge2, 8)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward1 + reward2, 8)
        })

        test('sum of stakes is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(contract.getTotalDeposits(), 8)
        })
    })
    describe('rewards distributed correctly after multiple distributions for one user',()=>{
        beforeEach(() => {
            contract.deposit(userA, 1000, 0)
            contract.distribute(0, 50)

            contract.distribute(1000, 100)
            contract.distribute(1000, 151)
            contract.distribute(1000, 152)
            contract.distribute(1000, 153)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(4000, 8)
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

        const userADepositAge1 = (block4 - block1)*amount1 
        const userADepositAge2 = (block5 - block4)*amount1
        const userADepositAge3 = (block6 - block5)*amount1
        const userADepositAge4 = (block7 - block6)*amount1

        const userBDepositAge1 = (block4 - block2)*amount2
        const userBDepositAge2 = (block5 - block4)*amount2
        const userBDepositAge3 = (block6 - block5)*amount2
        const userBDepositAge4 = (block7 - block6)*amount2

        const userCDepositAge1 = (block4 - block3)*amount3
        const userCDepositAge2 = (block5 - block4)*amount3
        const userCDepositAge3 = (block6 - block5)*amount3
        const userCDepositAge4 = (block7 - block6)*amount3

        const totalDepositAge1 = userADepositAge1 + userBDepositAge1 + userCDepositAge1
        const totalDepositAge2 = userADepositAge2 + userBDepositAge2 + userCDepositAge2
        const totalDepositAge3 = userADepositAge3 + userBDepositAge3 + userCDepositAge3
        const totalDepositAge4 = userADepositAge4 + userBDepositAge4 + userCDepositAge4

        beforeEach(() => {
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.deposit(userC, amount3, block3)

            contract.distribute(reward1, block4)
            contract.distribute(reward2, block5)
            contract.distribute(reward3, block6)
            contract.distribute(reward4, block7)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2 + reward3*userADepositAge3/totalDepositAge3 + reward4*userADepositAge4/totalDepositAge4, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2 + reward3*userBDepositAge3/totalDepositAge3 + reward4*userBDepositAge4/totalDepositAge4, 8)
            expect(contract.userReward(userC)).toBeCloseTo(reward1*userCDepositAge1/totalDepositAge1 + reward2*userCDepositAge2/totalDepositAge2 + reward3*userCDepositAge3/totalDepositAge3 + reward4*userCDepositAge4/totalDepositAge4, 8)
        })
        test('sum of rewards is consistent',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB) + contract.userReward(userC)).toBeCloseTo(reward1 + reward2 + reward3 + reward4, 8)
        })
        test('sum of balances is consistent',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB) + contract.userBalance(userC)).toBeCloseTo(amount1 + amount2 + amount3 + reward1 + reward2 + reward3 + reward4, 8)
        })
    })
    describe('rewards distributed correctly if no distributions were made for one of the users', ()=>{
        beforeEach(() => {
            contract.deposit(userA, 100, 0)
            contract.distribute(100, 50)
            contract.deposit(userB, 100, 100)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(100, 8)
            expect(contract.userReward(userB)).toBe(0, 8)
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

        const userADepositAge1 = (block2 - block1)*amount1 + (block3 - block2)*amount1 
        const userBDepositAge1 = (block2 - block1)*0 + (block3 - block2)*amount2
        const totalDepositAge1 = userADepositAge1 + userBDepositAge1

        const userADepositAge2 = (block4 - block3)*(amount1)
        const userBDepositAge2 = (block4 - block3)*(amount2)
        const totalDepositAge2 = userADepositAge2 + userBDepositAge2

        beforeEach(() => {
            contract.deposit(userA, amount1, block1)
            contract.deposit(userB, amount2, block2)
            contract.distribute(reward1, block3)
            contract.distribute(reward2, block4)
        })
        test('doesnt affect rewards',()=>{
            expect(contract.userReward(userA)).toBeCloseTo(reward1*userADepositAge1/totalDepositAge1 + reward2*userADepositAge2/totalDepositAge2, 8)
            expect(contract.userReward(userB)).toBeCloseTo(reward1*userBDepositAge1/totalDepositAge1 + reward2*userBDepositAge2/totalDepositAge2, 8)
        })
        test('doesnt affect total rewards',()=>{
            expect(contract.userReward(userA) + contract.userReward(userB)).toBeCloseTo(reward1 + reward2, 8)
        })
        test('doesnt affect deposits',()=>{
            expect(contract.userBalance(userA) + contract.userBalance(userB)).toBeCloseTo(amount1 + amount2 + reward1 + reward2, 8)
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
            contract.deposit(userA, amount1, block1)    
            contract.deposit(userB, amount2, block2)    
            contract.distribute(reward, block3)        
            stakeA = contract.userBalance(userA)
            stakeB = contract.userBalance(userB)
            totalDeposits = contract.getTotalDeposits()
            contract.deposit(userA, amount4, block4)    
            stakeA1 = contract.userBalance(userA)
            stakeB1 = contract.userBalance(userB)
            totalDeposits1 = contract.getTotalDeposits()
        })
        test('sum of rewards after the first distribution is consistent',()=>{
            expect(stakeA + stakeB).toBeCloseTo(totalDeposits, 8)
            expect(stakeA + stakeB).toBeCloseTo(amount1 + amount2 + reward, 8)
        })
        test('user stakes are consistent',()=>{
            expect(stakeB).toBeCloseTo(stakeB1, 8)
        })
        test('stakes are consistent',()=>{
            expect(stakeA1 + stakeB1).toBeCloseTo(totalDeposits1, 8)
            expect(stakeA1 + stakeB1).toBeCloseTo(amount1 + amount2 + reward + amount4, 8)
        })
    })

    describe('total deposits remain positive after reward withdrawal',()=>{
        const amount1 = 500
        const amount2 = 700
        const reward = 2000
        const block1 = 20
        const block2 = 40
        const block3 = 45
        const block4 = 50
        const block5 = 55

        let totalDepositsVar = 0
        beforeEach(() => {
            contract.deposit(userA, amount1, block1)    
            contract.deposit(userB, amount2, block2)    
            contract.distribute(reward, block3)        
            contract.withdraw(userA, contract.userBalance(userA), block4)    
            contract.withdraw(userB, contract.userBalance(userB), block5)    
            totalDepositsVar = contract.totalDeposits
        })
        test('total deposits are positive',()=>{
            const totalDepositsArePositive = (totalDepositsVar >= 0)
            expect(totalDepositsArePositive).toBe(true, 8)
        })
    })
})