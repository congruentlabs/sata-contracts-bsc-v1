# sata-contracts-bsc-v1

Derived from [binance-chain/canonical-upgradeable-bep20](https://github.com/binance-chain/canonical-upgradeable-bep20)

The BEP20 token is deployed as an upgradeable contract, with the upgrade disabling the minting function for security.

## Installation

```shell script
npm install
```

## Test

Start ganache:
```shell script
npm run testrpc
```

Run unittests:
```shell script
npm run truffle:test
```

## Flatten

```shell script
npm run flatten
```