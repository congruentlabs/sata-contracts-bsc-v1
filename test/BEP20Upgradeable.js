const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

const tenMil            = "10000000000000000000000000";
const tenThousand       = "10000000000000000000000";
const twentyMil         = "20000000000000000000000000";
const tokenName         = "Signata";
const tokenSymbol       = "SATA";
const tokenDecimals     = 18;

describe("bsc contract suite", () => {
  let deployer;
  let secondAccount;
  let thirdAccount;
  let bep20Token;

  before(async () => {
    const [account1, account2, account3] = await ethers.getSigners();
    deployer = account1;
    secondAccount = account2;
    thirdAccount = account3;
  });

  it("should deploy token contract via proxy", async () => {
    const BEP20Token = await ethers.getContractFactory("Token");

    bep20Token = await upgrades.deployProxy(BEP20Token, [
      tokenName,
      tokenSymbol,
      tokenDecimals,
      ethers.BigNumber.from(tenMil),
      true,
      deployer.address
    ]);

    await bep20Token.deployed();
  });

  it('token should be initially configured correctly', async () => {
    expect(await bep20Token.name()).to.equal(tokenName);
    expect(await bep20Token.symbol()).to.equal(tokenSymbol);
    expect(await bep20Token.decimals()).to.equal(tokenDecimals);
    expect(await bep20Token.totalSupply()).to.equal(ethers.BigNumber.from(tenMil));
    expect(await bep20Token.balanceOf(deployer.address)).to.equal(ethers.BigNumber.from(tenMil));
    expect(await bep20Token.getOwner()).to.equal(deployer.address);
  });

  it('should correctly function as a bep20 contract', async () => {
    expect(await bep20Token.balanceOf(secondAccount.address)).to.equal(ethers.BigNumber.from(0));
  
    await bep20Token.connect(deployer).transfer(secondAccount.address, ethers.BigNumber.from(tenThousand));
    expect(await bep20Token.balanceOf(secondAccount.address)).to.equal(ethers.BigNumber.from(tenThousand));
  });

  it('should be mintable and burnable', async () => {
    expect(await bep20Token.totalSupply()).to.equal(ethers.BigNumber.from(tenMil));
    await bep20Token.connect(deployer).mint(ethers.BigNumber.from(tenMil));
    expect(await bep20Token.totalSupply()).to.equal(ethers.BigNumber.from(twentyMil));
    await bep20Token.connect(deployer).burn(ethers.BigNumber.from(tenMil));
    expect(await bep20Token.totalSupply()).to.equal(ethers.BigNumber.from(tenMil));
  });

  it("should upgrade to non-minting contract", async () => {
    const BEP20TokenNoMinting = await ethers.getContractFactory("TokenNoMinting");
  
    expect(await upgrades.upgradeProxy(bep20Token.address, BEP20TokenNoMinting));
  });

  it('should no longer be mintable', async () => {    
    await expect(bep20Token.connect(deployer).mint(ethers.BigNumber.from(tenMil))).to.be.revertedWith("function selector was not recognized and there's no fallback function");
  });
})