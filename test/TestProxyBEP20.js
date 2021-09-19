const truffleAssert = require('truffle-assertions');

// const BEP20UpgradeableProxy = artifacts.require("BEP20UpgradeableProxy");
const BEP20TokenFactory = artifacts.require("BEP20TokenFactory");
const Token = artifacts.require("Token");
const { expect } = require("chai");
const TokenNoMinting = artifacts.require("TokenNoMinting");
const ApproveAndCallFallBackTest = artifacts.require("ApproveAndCallFallBackTest");

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const fs = require('fs');

let bep20TokenAddress;
let bep20FactoryOwner;
let proxyAdmin;
let bep20Owner;

const tenMil            = "10000000000000000000000000";
const twentyMil         = "20000000000000000000000000";
const tokenName         = "Signata";
const tokenSymbol       = "SATA";
const tokenDecimals     = 18;

contract('Upgradeable BEP20 token', (accounts) => {
    it('Create Token', async () => {
        const BEP20TokenFactoryInstance = await BEP20TokenFactory.deployed();
        bep20FactoryOwner = accounts[0];
        bep20Owner = accounts[1];
        proxyAdmin = accounts[0];

        const tx = await BEP20TokenFactoryInstance.createBEP20Token(
            tokenName,
            tokenSymbol,
            tokenDecimals,
            web3.utils.toBN(tenMil),
            true,
            bep20Owner,
            proxyAdmin,
            { from: bep20FactoryOwner }
        );
        truffleAssert.eventEmitted(tx, "TokenCreated",(ev) => {
            bep20TokenAddress = ev.token;
            return true;
        });

    });
    it('Test bep20 query methods', async () => {
        const jsonFile = "test/abi/IBEP20.json";
        const abi= JSON.parse(fs.readFileSync(jsonFile));

        bep20Owner = accounts[1];

        const bep20 = new web3.eth.Contract(abi, bep20TokenAddress);

        assert.equal(
            await bep20.methods.name().call({from: bep20Owner}),
            tokenName, "wrong token name");

        assert.equal(
            await bep20.methods.symbol().call({from: bep20Owner}),
            tokenSymbol, "wrong token symbol");

        assert.equal(
            await bep20.methods.decimals().call({from: bep20Owner}),
            tokenDecimals, "wrong token decimals");

        assert.equal(
            await bep20.methods.totalSupply().call({from: bep20Owner}),
            web3.utils.toBN(tenMil), "wrong totalSupply");

        assert.equal(
            await bep20.methods.balanceOf(bep20Owner).call({from: bep20Owner}),
            web3.utils.toBN(tenMil), "wrong balance");

        assert.equal(
            await bep20.methods.getOwner().call({from: bep20Owner}),
            bep20Owner, "bep20OwnerBalancewrong owner");
    });

    it('Test bep20 transaction methods', async () => {
        const jsonFile = "test/abi/IBEP20.json";
        const abi = JSON.parse(fs.readFileSync(jsonFile));

        bep20Owner = accounts[1];

        const bep20 = new web3.eth.Contract(abi, bep20TokenAddress);

        assert.equal(
            await bep20.methods.balanceOf(accounts[2]).call({from: bep20Owner}),
            web3.utils.toBN(0), "wrong balance");

        await bep20.methods.transfer(accounts[2], web3.utils.toBN(1e17)).send({from: bep20Owner});

        assert.equal(
            await bep20.methods.balanceOf(accounts[2]).call({from: bep20Owner}),
            web3.utils.toBN(1e17), "wrong balance");

        await bep20.methods.approve(accounts[3], web3.utils.toBN(1e17)).send({from: bep20Owner});

        let allowance = await bep20.methods.allowance(bep20Owner, accounts[3]).call({from: accounts[3]});
        assert.equal(allowance, web3.utils.toBN(1e17), "wrong allowance");

        await bep20.methods.transferFrom(bep20Owner, accounts[4], web3.utils.toBN(1e17)).send({from: accounts[3]});

        allowance = await bep20.methods.allowance(bep20Owner, accounts[3]).call({from: accounts[3]});
        assert.equal(allowance, web3.utils.toBN(0), "wrong allowance");

        assert.equal(
            await bep20.methods.balanceOf(accounts[4]).call({from: accounts[4]}),
            web3.utils.toBN(1e17), "wrong balance");
    });

    it('Test mint and burn', async () => {
        const jsonFile = "test/abi/Token.json";
        const abi= JSON.parse(fs.readFileSync(jsonFile));

        bep20Owner = accounts[1];

        const bep20 = new web3.eth.Contract(abi, bep20TokenAddress);

        let totalSupply = await bep20.methods.totalSupply().call({from: bep20Owner});
        assert.equal(totalSupply, web3.utils.toBN(tenMil), "wrong totalSupply");

        await bep20.methods.mint(web3.utils.toBN(tenMil)).send({from: bep20Owner});

        totalSupply = await bep20.methods.totalSupply().call({from: bep20Owner});
        assert.equal(totalSupply, web3.utils.toBN(twentyMil), "wrong totalSupply");

        await bep20.methods.transfer(accounts[5], web3.utils.toBN(tenMil)).send({from: bep20Owner});
        await bep20.methods.burn(web3.utils.toBN(tenMil)).send({from: accounts[5]});

        totalSupply = await bep20.methods.totalSupply().call({from: accounts[5]});
        assert.equal(totalSupply, web3.utils.toBN(tenMil), "wrong totalSupply");
    });
    it('Test ApproveAndCallFallBack', async () => {
        proxyAdmin = accounts[0];
        bep20Owner = accounts[1];

        let jsonFile = "test/abi/UpgradeProxy.json";
        let abi = JSON.parse(fs.readFileSync(jsonFile));

        const bep20Proxy = new web3.eth.Contract(abi, bep20TokenAddress);
        await bep20Proxy.methods.upgradeTo(TokenNoMinting.address).send({from: proxyAdmin});

        jsonFile = "test/abi/TokenNoMinting.json";
        abi = JSON.parse(fs.readFileSync(jsonFile));

        const bep20 = new web3.eth.Contract(abi, bep20TokenAddress);

        await bep20.methods.approveAndCall(ApproveAndCallFallBackTest.address, web3.utils.toBN(1e18), web3.utils.hexToBytes("0x")).send({from: bep20Owner});
    });
});
