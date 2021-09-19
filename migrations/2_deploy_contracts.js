const { eventEmitted } = require('truffle-assertions');
const Token = artifacts.require("Token");
const TokenNoMinting = artifacts.require("TokenNoMinting");
const ApproveAndCallFallBackTest = artifacts.require("ApproveAndCallFallBackTest");
const BEP20TokenFactory = artifacts.require("BEP20TokenFactory");

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const fs = require('fs');
const tenMil            = "10000000000000000000000000";

module.exports = async (deployer, network, accounts) => {  
  console.log("Network: " + network);
  console.log(accounts);

  await deployer.deploy(Token);
  const tokenInstance = await Token.deployed();

  await deployer.deploy(TokenNoMinting);
  const tokenNoMintingInstance = await TokenNoMinting.deployed();

  await deployer.deploy(BEP20TokenFactory, tokenInstance.address);
  const bep20TokenFactoryInstance = await BEP20TokenFactory.deployed();

  if (network === "development") {
    await deployer.deploy(ApproveAndCallFallBackTest);
    const testInstance = await ApproveAndCallFallBackTest.deployed();

    // the remainder of the tests on the dev network are handled in the unit tests
  } else {
    // instantiate the token
    await bep20TokenFactoryInstance.createBEP20Token(
      "Signata",
      "SATA",
      18,
      web3.utils.toBN(tenMil),
      true,
      accounts[1],
      accounts[0],
      { from: accounts[1] }
    );

    const jsonFile = "migrations/UpgradeProxy.json";
    const abi = JSON.parse(fs.readFileSync(jsonFile));
    const bep20Proxy = new web3.eth.Contract(abi, tokenInstance.address);
    // upgrade it to disable minting
    await bep20Proxy.methods.upgradeTo(tokenNoMintingInstance.address).send({ from: accounts[1] });
  }
};
