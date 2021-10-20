async function main() {
  const [account1] = await ethers.getSigners();

  const BEP20Token = await ethers.getContractFactory("Token");
  const BEP20TokenNoMinting = await ethers.getContractFactory("Token");

  const bep20Token = await upgrades.deployProxy(BEP20Token, [
    "Signata",
    "SATA",
    18,
    ethers.BigNumber.from("10000000000000000000000000"),
    true,
    account1.address
  ]);

  await bep20Token.deployed();
  console.log(bep20Token.address);

  await upgrades.upgradeProxy(bep20Token.address, BEP20TokenNoMinting);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });