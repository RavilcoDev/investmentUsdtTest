import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Investment", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const DAYS_IN_SECS = 24 * 60 * 60;

    const [owner, accountWithVSION, accountWithOutVSION] = await ethers.getSigners();

    const USDT = await ethers.getContractFactory("USDT");
    const usdt = await USDT.deploy();
    const VSION = await ethers.getContractFactory("VSION");
    const vsion = await VSION.deploy();

    await usdt.transfer(accountWithVSION.address, 10000)
    await usdt.transfer(accountWithOutVSION.address, 10000)
    await usdt.transfer(vsion.address, 10000)

    await vsion.transfer(accountWithVSION.address, 10000)


    const Investment = await ethers.getContractFactory("Investment");
    const investment = await Investment.deploy(usdt.address, vsion.address);

    const firstTimeCondition = (await time.latest()) +  DAYS_IN_SECS * 45
    const secondTimeCondition = (await time.latest())  + DAYS_IN_SECS * 180
    return {
      investment,
      usdt,
      vsion,
      owner,
      accountWithVSION,
      accountWithOutVSION,
      firstTimeCondition,
      secondTimeCondition
    };
  }

  describe("Deployment", function () {
    it("Should return const 45 of INITIAL_RATES 0 daysReturn ", async function () {
      const { investment } = await loadFixture(deployOneYearLockFixture);

      const INITIAL_RATES =  await investment.INITIAL_RATES(0)
      const daysReturn = INITIAL_RATES.daysReturn

      expect(daysReturn).to.be.equal(45);
    });
    it("Should first invesment typeRateDevolution 0 and balance 100 ", async function () {
      const { investment,  accountWithVSION,  usdt} = await loadFixture(deployOneYearLockFixture);
      await usdt.connect(accountWithVSION).approve(investment.address, 100)
      // const res =  await usdt.allowance(accountWithVSION.address, investment.address)
      await  investment.connect(accountWithVSION).investment(100,0)
      const balancesDevolution = await  investment.balancesDevolution(1)
      expect(balancesDevolution.yieldRate).to.be.equal(0);
      expect(balancesDevolution.balance).to.be.equal(100);
    });

    it("Should first case invesment type and balance ", async function () {
      const { investment,  accountWithVSION, usdt, firstTimeCondition} = await loadFixture(deployOneYearLockFixture);
      await usdt.connect(accountWithVSION).approve(investment.address, 100)
      // const res =  await usdt.allowance(accountWithVSION.address, investment.address)
      const FIRST_TYPE_YIELD_RATE = 0

      await  investment.connect(accountWithVSION).investment(100, FIRST_TYPE_YIELD_RATE)
      const balancesDevolution = await investment.balancesDevolution(1)

      expect(balancesDevolution.yieldRate).to.be.equal(FIRST_TYPE_YIELD_RATE);
      expect(balancesDevolution.balance).to.be.equal(100);

      console.log(await usdt.balanceOf(investment.address))
      // 45 days after
      await time.increaseTo(firstTimeCondition + 1);

      await investment.connect(accountWithVSION).withdraw(1);

      const balanceOfAccount = await usdt.balanceOf(accountWithVSION.address);
      const expectBalance = 10000 - 100 + 18
      expect(balanceOfAccount).to.be.equal(expectBalance);

    });

    it("Should second case invesment type and balance ", async function () {
      const { investment,  accountWithVSION, usdt, secondTimeCondition} = await loadFixture(deployOneYearLockFixture);
      await usdt.connect(accountWithVSION).approve(investment.address, 100)
      // const res =  await usdt.allowance(accountWithVSION.address, investment.address)
      const SECOND_TYPE_YIELD_RATE = 1

      await  investment.connect(accountWithVSION).investment(100, SECOND_TYPE_YIELD_RATE)
      const balancesDevolution = await investment.balancesDevolution(1)

      expect(balancesDevolution.yieldRate).to.be.equal(SECOND_TYPE_YIELD_RATE);
      expect(balancesDevolution.balance).to.be.equal(100);

      console.log(await usdt.balanceOf(investment.address))
      // 45 days after
      await time.increaseTo(secondTimeCondition + 1);

      await investment.connect(accountWithVSION).withdraw(1);

      const balanceOfAccount = await usdt.balanceOf(accountWithVSION.address);
      const expectBalance = 10000 - 100 + 48
      expect(balanceOfAccount).to.be.equal(expectBalance);

    });
  });
});
