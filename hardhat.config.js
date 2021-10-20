require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');

const { task } = require('hardhat/config');
const fs = require('fs');
const mainnetMnemonic = fs.readFileSync(".secret").toString().trim();
const testnetMnemonic = fs.readFileSync(".secret-test").toString().trim();

task("accounts", "list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.7"
      },
      {
        version: "0.8.0"
      }
    ],
    settings: {
      optimizer: {
        enabled: true
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    testnet: {
      url: 'https://speedy-nodes-nyc.moralis.io/acb1b8c41c975bdb9190116a/bsc/testnet',
      chainId: 97,
      gasPrice: 20000000000,
      accounts: { mnemonic: testnetMnemonic }
    },
    mainnet: {
      url: "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: { mnemonic: mainnetMnemonic }
    }
  }
};
