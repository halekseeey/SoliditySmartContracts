import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("DutchAuction", function () {
  async function deploy() {
    const [user] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("DutchAuction");
    const auction = await Factory.deploy(1000000, 1, "item");

    return { auction, user };
  }

  it("allows to buy", async function () {
    const { auction, user } = await loadFixture(deploy);

    await time.increase(60); // 2

    const latest = await time.latest();
    const newLatest = latest + 1;
    await time.setNextBlockTimestamp(newLatest);

    const startPrice = await auction.startingPrice();
    const startAt = await auction.startAt();
    const elapsed = BigInt(newLatest) - startAt;
    const discout = elapsed * (await auction.discountRate());
    const price = startPrice - discout;

    const buyTx = await auction.buy({ value: price + 100n }); // 3
    await buyTx.wait();

    expect(await ethers.provider.getBalance(await auction.getAddress())).to.eq(
      price
    );

    await expect(buyTx).to.changeEtherBalance(user, -price);
  });
});
