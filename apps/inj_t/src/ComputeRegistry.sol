// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title ComputeRegistry for injectiveai
 * @dev This contract acts as a directory for compute providers and their nodes.
 * It is a standalone contract with no external dependencies.
 */
contract ComputeRegistry {
    // --- Structs ---

    // Represents a single compute node owned by a provider.
    struct ComputeNode {
        address provider;      // The address of the provider who owns this node.
        address subkey;        // The unique key or address of the node itself.
        string  specsURI;      // A URI pointing to the node's technical specifications.
        uint32  computeUnits;  // A measure of the node's computational power.
    }

    // --- State Variables ---

    // A mapping to check if a provider address is registered.
    mapping(address => bool) public isProviderRegistered;

    // A nested mapping to store the nodes associated with each provider.
    // providerAddress => nodeSubkey => ComputeNode
    mapping(address => mapping(address => ComputeNode)) public nodes;

    // The address of the account that has administrative control.
    address public injectiveAIAdmin;

    // --- Events ---

    event ProviderRegistered(address indexed provider);
    event ComputeNodeAdded(address indexed provider, address indexed nodeSubkey);

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

    // --- Functions ---

    /**
     * @notice Allows any address to register as a compute provider.
     */
    function register() external {
        address provider = msg.sender;
        require(!isProviderRegistered[provider], "Provider is already registered");

        isProviderRegistered[provider] = true;
        emit ProviderRegistered(provider);
    }

    /**
     * @notice Allows a registered provider to add a new compute node.
     * @param nodeSubkey The unique address/key of the compute node.
     * @param computeUnits The computational power of the node.
     * @param specsURI A URI pointing to the node's specifications.
     */
    function addComputeNode(
        address nodeSubkey,
        uint32 computeUnits,
        string calldata specsURI
    ) external {
        address provider = msg.sender;
        require(isProviderRegistered[provider], "Caller is not a registered provider");
        require(nodes[provider][nodeSubkey].provider == address(0), "Node already exists for this provider");

        nodes[provider][nodeSubkey] = ComputeNode({
            provider: provider,
            subkey: nodeSubkey,
            computeUnits: computeUnits,
            specsURI: specsURI
        });

        emit ComputeNodeAdded(provider, nodeSubkey);
    }
}