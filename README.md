# my-upgradeable-contract
My study and trial building of a upgradeable solidity smart contract using hardhat and OpenZeppelin Hardhat Upgrades plugin



#### deploy
`npx hardhat run ./scripts/deployProxy.js --network sepolia`

#### Verify Contract on Etherscan
> Note! Do NOT verify your deployed Proxy address, you want to verify the VendingMachineV1!

`npx hardhat verify --network sepolia 0x9D115F832c446E4a765794431d7B1Ed152ADA847`

```
The contract 0x9D115F832c446E4a765794431d7B1Ed152ADA847 has already been verified on the block explorer. If you're trying to verify a partially verified contract, please use the --force flag.
https://sepolia.etherscan.io/address/0x9D115F832c446E4a765794431d7B1Ed152ADA847#code

The contract 0x9D115F832c446E4a765794431d7B1Ed152ADA847 has already been verified on Sourcify.
https://repo.sourcify.dev/contracts/full_match/11155111/0x9D115F832c446E4a765794431d7B1Ed152ADA847/
```




# How to Deploy an Upgradeable Vending Machine Smart Contract

## How to Deploy an Upgradeable Vending Machine Smart Contract

In this guide, we will run through deploying smart contracts that use the transparent proxy pattern in order to be upgradeable. Deploying your contracts under a proxy can be useful in order to future-proof your smart contract functionality. You will be able to deploy a version 1 contract, add new functionality and then deploy a version 2 of that contract under the proxy, and so on...

![https://res.cloudinary.com/divzjiip8/image/upload/v1673520308/alchemyu/Untitled_20.png](https://res.cloudinary.com/divzjiip8/image/upload/v1673520308/alchemyu/Untitled_20.png)

The above diagram we looked at in the previous section is the same one we will replicate in this activity. ⬆️

## Why Are We Upgrading a Vending Machine?! 🤖

We know the example might seem simplistic, but for learning purposes this actually works pretty great... think about it: a real life vending machine has certain abilities... it can:

- dispense a drink if the user inputs the coins/cash required
- typically vending machines hold drinks, but they can also hold snacks
- some vending machines accept credit cards, which is a nice feature for users
- some vending machines provide cold drinks, some don't

These are just typical features of a vending machine! Right. But put yourself in the shoes of a vending machine's owner for a minute... you have to consider *so* many things:

- What drinks/snacks sell the best?
- What price points are the right balance between profit and customer satisfaction?
- Should I optimize for more drinks, more snacks, only drinks, only snacks? What are the space tradeoffs of each one?
- How much real estate do I even have to set this vending machine? And how much will rent cost?
- How many people even pass by the machine every day?
- etc, etc, etc

As you can see, for something as simple as a vending machine, these decisions are quite tough to make! Similarly, when deploying a dApp, developers can be faced with many similar decisions!

Luckily, upgradeable smart contracts give them flexibility to choose a more iterative approach to solving these problems - rather then going with a solution set in stone forever. 🗿 The above are all *planned* considerations... but what about *unplanned* or as us developers call them **bugs**? Let's run through some hypothetical ones, still using the vending machine example:

- The machine was set up with a mechanical issue that prevents sodas from being dispensed.
- The machine coin slot is left unlocked accidentally.
- The soda brand being advertised on the machine goes out of business.
- The city council builds a new pedestrian road around where your machine is placed, now no one passes by it.
- One of the buttons was pressed so hard by someone that it jammed.

We didn't even mention the case where you as a business owner just want to... well... **upgrade**!

- Your machine is doing so well, you need to set up a new bigger one that can handle a larger flow of people more efficiently.
- Your machine is doing so well, you add new soda brands.
- In order to reward your users, you've set up a loyalty points system.
- Your machine was initially set up to only accept coins, you have now upgraded it to accept coins, cash, bitcoin, ether and credit cards - giving it access to whole new markets of users (ayooo!).

All right, all right.. you get the point!

Just like in real life you need flexibility to account for bugs, issues and iterative upgrades, smart contract upgradeability gives you that flexibility and we will get to see this first hand via deploying an upgradeable vending machine smart contract.

## Guide Requirements

In this guide, we will use the following packages/plugins:

1. [OpenZeppelin Upgradeable Package](https://docs.openzeppelin.com/contracts/4.x/upgradeable)
2. [OpenZeppelin Hardhat Upgrades plugin](https://docs.openzeppelin.com/upgrades-plugins/1.x/)

## Step 1: Set Up Hardhat Project Structure

## Install Dependencies
`npm init -y`
`npm install --save-dev hardhat`
`npm install --save-dev @openzeppelin/hardhat-upgrades`
`npm install @openzeppelin/contracts-upgradeable`
`npm install --save-dev @nomicfoundation/hardhat-ethers ethers # peer dependencies`
follow this guide [hardhat-verify](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify)
verify on etherscan `npm install --save-dev @nomicfoundation/hardhat-verify`
Then start a hardhat project `npx hardhat init`

## Set up `.env` File & Variables
```
ALCHEMY_SEPOLIA_URL=
SEPOLIA_PRIVATE_KEY=
ETHERSCAN_KEY=
```

## Add Important Configuartions to `hardhat.config.js`

Ok! We're almost there. We just need to add a couple of important things to the `hardhat.config.js` file:

1. Open the `hardhat.config.js` in your project root
2. Overwrite the *entire* file that Hardhat included as part of the sample project, and copy-paste the following contents:

```
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_URL,
      accounts: [process.env.SEAN_PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.ALCHEMY_MAINNET_URL,
      accounts: [process.env.SEAN_PRIVATE_KEY],
    },
    localhost: {
      url: "http://127.0.0.1:8545/"
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_KEY
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};

```

Almost there! We are done setting up the `hardhat.config.js`, go ahead and save/close it.

**We are done with project setup - nice!** 💥 Let the fun begin! 🎸🔥

## Step 2: Add Smart Contracts

Just for learning, we will be looking to upgrade a `VendingMachineV1.sol` contract to a `VendingMachineV2.sol` contract. The goal is to preserve the original `VendingMachineV1.sol` state while also being able to add new functionality via `VendingMachineV2`, `VendingMachineV3`, etc.

## Add Code Files

1. In your `/contracts` folder, run `touch VendingMachineV1.sol`
2. Open the `VendingMachine.sol` file and copy-paste the following contents:

    ```solidity
    // SPDX-License-Identifier: MIT
    pragmasolidity 0.8.17;

    import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

    contract VendingMachineV1is Initializable {
    // these state variables and their values
    // will be preserved forever, regardless of upgrading
    uintpublic numSodas;
    addresspublic owner;

    function initialize(uint _numSodas)public initializer {
        numSodas = _numSodas;
        owner = msg.sender;
    }

    function purchaseSoda()publicpayable {
    require(msg.value >= 1000 wei, "You must pay 1000 wei for a soda!");
        numSodas--;
    }
    }

    ```

You'll notice a couple of things have changed from the typical contracts we write here at AU:

- The contract inherits from `Initializable`, imported from the [`@openzeppelin/contracts-upgradeable`](https://docs.openzeppelin.com/contracts/4.x/upgradeable) package
- The contract no longer has a `constructor`! Instead it is replaced with an `initialize()` along with the `initializer` modifier, which is also inherited from the same OZ package.

> No constructor?! This is an upgradeable smart contract and so it is written a little different. Read more about writing upgradeable smart contracts. 👀
> 

**This is our *V1* contract.** Pretty simple right? In it, we have:

- a `public` state variable: `uint numSodas`
- a `public` state variable: `address owner`
- **one**`function` called `purchaseSoda()` that requires a user send `1000 wei` in order to "purchase a soda" which for now just deducts 1 from the `numSodas` state variable

At surface level, this seems like a great little vending machine contract and we are excited to deploy it to the test network! ☺️

> Hint: This contract might have a bug! 🦟 Can you spot what it is already? 💸
> 

## Step 3: Write a Deploy Script to Deploy VendingMachineV1

We will deploy our contract slightly different than we usually do...

1. In your `/scripts` folder, run `touch deployProxy.js`
2. Open the `deployProxy.js` file and copy-paste the following contents:

```
const { ethers, upgrades } = require('hardhat');

async function main() {
  const VendingMachineV1 = await ethers.getContractFactory('VendingMachineV1');
  const proxy = await upgrades.deployProxy(VendingMachineV1, [100]);
  await proxy.waitForDeployment();

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxy.target
  );

  console.log('Proxy contract address: ' + proxy.target);

  console.log('Implementation contract address: ' + implementationAddress);
}

main();

```

Notice the command used is `deployProxy()`. It takes the arguments passed into the `VendingMachineV1`'s `initialize()` function in array format.

We are deploying our `VendingMachineV1` with the `numSodas` state variable set to `100`. Feel free to set it to whatever you like!

1. Save the file.
2. You are now ready to deploy `VendingMachineV1`!

## Step 4: Deploy (and Verify) your Contracts!

## Run Deploy Script

1. In your project root folder, run `npx hardhat run scripts/deployProxy.js --network sepolia`
2. After a few seconds, your terminal console will display both the deployed Proxy contract address AND the Implementation contract address

> Keep both of these addresses handy! You'll need em for the next step :)
> 

At this point, the Implementation contract may actually already be verified! The reason is Etherscan has already verified that exact same contract bytecode and will show any previously verified contracts accordingly. Don't worry if it already is, you can still run through confirming verification and you will still verify any future upgrades as well!

If it is not yet verified, Etherscan will only show the contract bytecode which means our proxy address will not be able to use the Etherscan's `Read as Proxy` and `Write as Proxy` functionality! We definitely want to be able to do this. And we want to be able to see the code inside our original implementation contract too!

## Verify Contract on Etherscan

1. Copy the implementation address, go to your terminal and run the following command:

```
npx hardhat verify --network sepolia YOUR_VENDINGMACHINEV1_IMPLEMENTATION_ADDRESS

```

> Note! Do NOT verify your deployed Proxy address, you want to verify the VendingMachineV1!
> 

This command will compile your contract and send the bytecode to Etherscan, Etherscan will verify it and your contract code should now be readable! ✅

## Step 5: Interact With `VendingMachineV1` via its Proxy contract!

Thanks to [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967), we can interact with our `VendingMachineV1` Implementation contract directly via our Proxy contract!

**We can do this in a script any time**, *but* since we have verified the BoxV1 contract, let's read/write it using Etherscan just for fun (and also, this is functionality used by many web3 users!).

1. From you terminal, copy your Proxy contract address
2. Paste it into sepolia etherscan
3. Select the 'Contract' tab
4. On the right-hand side, select 'More Options'
5. Select 'Is this a proxy?'
6. Select 'Verify'
7. Select 'Save'
8. Now, go back to your Proxy contract's Etherscan page

You will now see the following new options appear on the tabs:

![https://res.cloudinary.com/divzjiip8/image/upload/v1673515662/alchemyu/Screen_Shot_2023-01-12_at_1.27.36_AM.png](https://res.cloudinary.com/divzjiip8/image/upload/v1673515662/alchemyu/Screen_Shot_2023-01-12_at_1.27.36_AM.png)

You can now `Read as Proxy` and `Write as Proxy`, exactly as we initially intended! 👏

If you've done everything correctly up until this point, reading the contract as the proxy should just give you one option: `numSodas` and its state should be equal to `100`.

## Step 6: Upgrade Proxy to `VendingMachineV2`

Guess what? Our V1 machine works pretty great for a basic vending machine... but, it has one major issue:

- There's no `withdrawProfits()` function! Ahhhh!! We've basically created a one-way sink for ether and that's really bad. It's ok, we made our contract upgradeable so we can iterate a fix for this: add in a `withdraw()` function that is admin-protected.

Here's a suggestion or two of what you can add to a further **V3** Vending Machine, but there is soooo much more:

- a `mapping` that keeps track of how many sodas a user has purchased (this can lay the ground for future upgraded functionality such as loyalty points)
- there is literally NO check on the purchaseSoda() function to make sure `numSodas` is not <= 0. How would we fix this? Also, there. is no way to add new sodas to the machine!

If we hadn't made this contract upgradeable, we'd have to deploy a whole *new* contract just do this, and we'd lose **all** of our transaction and storage history! At production scale, that can be pretty bad!

## Add `VendingMachineV2.sol` File

1. In your project, go to your `/contracts` folder and run `touch VendingMachineV2.sol`
2. Open the `VendingMachineV2.sol` file and copy-paste the following contents:

```solidity
// SPDX-License-Identifier: MIT
pragmasolidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VendingMachineV2is Initializable {
  // these state variables and their values
  // will be preserved forever, regardless of upgrading
uintpublic numSodas;
addresspublic owner;

function initialize(uint _numSodas)public initializer {
    numSodas = _numSodas;
    owner = msg.sender;
  }

function purchaseSoda()publicpayable {
require(msg.value >= 1000 wei, "You must pay 1000 wei for a soda!");
    numSodas--;
    // challenge: add a mapping to keep track of user soda purchases!
  }

function withdrawProfits()public onlyOwner {
require(address(this).balance > 0, "Profits must be greater than 0 in order to withdraw!");
    (bool sent, ) = owner.call{value:address(this).balance}("");
require(sent, "Failed to send ether");
  }

function setNewOwner(address _newOwner)public onlyOwner {
    owner = _newOwner;
  }

modifier onlyOwner() {
require(msg.sender == owner, "Only owner can call this function.");
_;
  }
}

```

In our **V2** upgrade above, we have added:

- a new modifier: `onlyOwner` to use in order to admin-protect function
- two new functions:
    - `withdrawProfits()`: allows for the contract owner to withdraw vending machine profits
    - `setOwner`: allows the current contract owner to set a new owner for the vending machine

## Add Special Upgrade Script

We will also need a special script to perform the upgrade on the existing proxy contract which now points to `VendingMachineV1`.

1. In your `/scripts` folder, run `touch upgradeProxy.js`
2. Open the `upgradeProxy.js` file and copy-paste the following contents:

```
const { ethers, upgrades } = require('hardhat');

// TO DO: Place the address of your proxy here!
const proxyAddress = '';

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

```

> Make sure to copy-paste the Proxy contract address (which currently points to VendingMachineV1) into the above script!
> 

You are now ready to upgrade your contract! What the script does is basically change the current Proxy pointer to a newly deployed `VendingMachineV2`!

1. In your project root, run `npx hardhat run scripts/upgradeProxy.js --network goerli`

While we are here, let's go ahead and verify `VendingMachineV2`. Get the implementation contract address from the terminal output of your upgrade script!

1. Verify the `VendingMachineV2` contract by running `npx hardhat verify --network goerli VendingMachineV2_CONTRACT_ADDRESS`

You should now be able to interact with your VERSION 2 upgrades directly from your Proxy contract on Etherscan as we did in the last step!

Should you need to upgrade the V2 contract, you would just do the same steps but with a V3 contract and so on...

**Happy upgrading!** 🏗