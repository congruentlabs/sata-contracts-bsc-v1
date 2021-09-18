const Token = artifacts.require("Token");
const TokenNoMinting = artifacts.require("TokenNoMinting");
const ApproveAndCallFallBackTest = artifacts.require("ApproveAndCallFallBackTest");
const BEP20TokenFactory = artifacts.require("BEP20TokenFactory");

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const fs = require('fs');

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    await deployer.deploy(Token);
    await deployer.deploy(TokenNoMinting);
    await deployer.deploy(ApproveAndCallFallBackTest);
    await deployer.deploy(BEP20TokenFactory, Token.address);
  });
};
