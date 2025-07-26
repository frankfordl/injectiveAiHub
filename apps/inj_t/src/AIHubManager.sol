// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title AIHubManager for injectiveai
 * @dev This contract allows providers to stake funds for specific AI models,
 * defining a name and a maximum number of participants for each "hub".
 */
contract AIHubManager {

    // --- Structs ---

    // Represents a single staked AI project or "hub".
    struct AIHub {
        address provider;         // The address of the account that created the hub.
        string modelName;         // The name of the AI model for this hub.
        uint256 maxParticipants;  // The maximum number of nodes allowed to join.
        uint256 totalStake;       // The total amount of native tokens staked for this hub.
    }

    // --- State Variables ---

    // A counter to ensure each hub gets a unique ID.
    uint256 private _hubIdCounter;

    // Mapping from a unique hub ID to the AIHub struct.
    mapping(uint256 => AIHub) public hubs;

    // The address of the account that has administrative control.
    address public injectiveAIAdmin;

    // --- Events ---

    event HubCreated(
        uint256 indexed hubId,
        address indexed provider,
        string modelName,
        uint256 maxParticipants,
        uint256 amountStaked
    );

    // --- Modifiers ---

    /**
     * @dev Restricts a function to be called only by the admin.
     */
    modifier onlyAdmin() {
        require(msg.sender == injectiveAIAdmin, "Only admin can perform this action");
        _;
    }

    /**
     * @dev The constructor runs once when the contract is deployed.
     * It sets the deployer of the contract as the admin.
     */
    constructor() {
        injectiveAIAdmin = msg.sender;
    }

    // --- Core Functions ---

    /**
     * @notice Creates and stakes for a new AI Hub.
     * @param modelName The name of the AI model.
     * @param maxParticipants The maximum number of participants allowed.
     */
    function createHub(string calldata modelName, uint256 maxParticipants) external payable {
        require(msg.value > 0, "Stake amount must be greater than zero");
        require(bytes(modelName).length > 0, "Model name cannot be empty");

        uint256 hubId = _hubIdCounter;

        hubs[hubId] = AIHub({
            provider: msg.sender,
            modelName: modelName,
            maxParticipants: maxParticipants,
            totalStake: msg.value
        });

        // Increment the counter for the next hub.
        _hubIdCounter++;

        emit HubCreated(hubId, msg.sender, modelName, maxParticipants, msg.value);
    }

    /**
     * @notice Gets the details of a specific AI Hub.
     * @param hubId The ID of the hub to retrieve.
     * @return The AIHub struct containing all its details.
     */
    function getHub(uint256 hubId) external view returns (AIHub memory) {
        return hubs[hubId];
    }
}