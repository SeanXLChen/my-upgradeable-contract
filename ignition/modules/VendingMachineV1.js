const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VendingMachineModule", (m) => {
    const deployer = m.getAccount(0);
    const counter = m.contract("VendingMachineV1", [], { from: deployer });
    return { counter };
});