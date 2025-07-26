// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/AIHubManager.sol";

contract CreateHubScript is Script {
    function run() external {
        // --- Configuration ---
        string memory modelName = "injctiveaiinfra10b";
        uint256 maxParticipants = 100; // You can change this number if you like
        uint256 stakeAmount = 0.01 ether; // This represents 0.01 INJ

        // --- Execution ---
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy the AIHubManager contract
        AIHubManager hubManager = new AIHubManager();
        console.log("AIHubManager contract deployed at address:", address(hubManager));

        // Step 2: Call the createHub function with your parameters and stake
        hubManager.createHub{value: stakeAmount}(modelName, maxParticipants);
        console.log("Successfully created hub for model:", modelName);
        console.log("Hub ID: 0"); // The first hub created will have an ID of 0

        vm.stopBroadcast();
    }
}