const { ethers, upgrades } = require('hardhat');

// TO DO: Place the address of your proxy here!
const proxyAddress = '0x21419F19e28364cDB4F3AcE9037158b2fC4aD4cC';

async function main() {
  const VendingMachineV2 = await ethers.getContractFactory('VendingMachineV2');
  const upgraded = await upgrades.upgradeProxy(proxyAddress, VendingMachineV2);

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  // Correct handling of the async call to owner()
  const ownerAddress = await upgraded.owner();
  console.log("The current contract owner is: " + ownerAddress);
  console.log('Implementation contract address: ' + implementationAddress);
}

main();