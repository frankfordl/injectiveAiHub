// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./interfaces/IComputeRegistry.sol";
import "./interfaces/IStakeManager.sol";
import "./interfaces/IDomainRegistry.sol";
import "./interfaces/IWorkValidation.sol";
import "./interfaces/IComputePool.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract InjectiveAiHub is AccessControlEnumerable {
    using MessageHashUtils for bytes32;

    bytes32 public constant FEDERATOR_ROLE = keccak256("FEDERATOR_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    IComputeRegistry public computeRegistry;
    IDomainRegistry public domainRegistry;
    IStakeManager public stakeManager;
    IComputePool public computePool;

    // Events
    event ProviderRegistered(address indexed provider, uint256 stake);
    event ProviderDeregistered(address indexed provider);
    event ProviderWhitelisted(address indexed provider);
    event ProviderBlacklisted(address indexed provider);
    event ComputeNodeAdded(address indexed provider, address indexed nodekey, string specsURI);
    event ComputeNodeRemoved(address indexed provider, address indexed nodekey);
    event ComputeNodeValidated(address indexed provider, address indexed nodekey);
    event ComputeNodeInvalidated(address indexed provider, address indexed nodekey);

    constructor(address _federator, address _validator) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FEDERATOR_ROLE, _federator);
        _grantRole(VALIDATOR_ROLE, _validator);
    }

    function setModuleAddresses(
        address _computeRegistry,
        address _domainRegistry,
        address _stakeManager,
        address _computePool
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        computeRegistry = IComputeRegistry(_computeRegistry);
        domainRegistry = IDomainRegistry(_domainRegistry);
        stakeManager = IStakeManager(_stakeManager);
        computePool = IComputePool(_computePool);
        computeRegistry.setComputePool(address(computePool));
    }

    function setFederator(address _federator) external onlyRole(FEDERATOR_ROLE) {
        grantRole(FEDERATOR_ROLE, _federator);
        revokeRole(FEDERATOR_ROLE, msg.sender);
    }

    function setValidator(address _validator) external onlyRole(FEDERATOR_ROLE) {
        grantRole(VALIDATOR_ROLE, _validator);
        revokeRole(VALIDATOR_ROLE, msg.sender);
    }

    function whitelistProvider(address provider) external {
        require(
            hasRole(VALIDATOR_ROLE, msg.sender) || hasRole(FEDERATOR_ROLE, msg.sender),
            "Must have VALIDATOR_ROLE or FEDERATOR_ROLE"
        );
        computeRegistry.setWhitelistStatus(provider, true);
        emit ProviderWhitelisted(provider);
    }

    function blacklistProvider(address provider) external onlyRole(VALIDATOR_ROLE) {
        computeRegistry.setWhitelistStatus(provider, false);
        emit ProviderBlacklisted(provider);
    }

    function validateNode(address provider, address nodekey) external onlyRole(VALIDATOR_ROLE) {
        uint256 requiredStake = calculateMinimumStake(provider, 0);
        uint256 providerStake = stakeManager.getStake(provider);
        require(providerStake >= requiredStake, "Insufficient stake");
        computeRegistry.setNodeValidationStatus(provider, nodekey, true);
        emit ComputeNodeValidated(provider, nodekey);
    }

    function invalidateNode(address provider, address nodekey) external onlyRole(VALIDATOR_ROLE) {
        computeRegistry.setNodeValidationStatus(provider, nodekey, false);
        emit ComputeNodeInvalidated(provider, nodekey);
    }

    function setStakeMinimum(uint256 amount) external onlyRole(FEDERATOR_ROLE) {
        stakeManager.setStakeMinimum(amount);
    }

    function createDomain(string calldata domainName, IWorkValidation validationLogic, string calldata domainURI)
        external
        onlyRole(FEDERATOR_ROLE)
        returns (uint256)
    {
        uint256 domainId = domainRegistry.create(domainName, computePool, validationLogic, domainURI);
        return domainId;
    }

    function updateDomainValidationLogic(uint256 domainId, address validationLogic) external onlyRole(FEDERATOR_ROLE) {
        domainRegistry.updateValidationLogic(domainId, validationLogic);
    }

    function registerProvider() external payable {
        uint256 stake = msg.value;
        uint256 stakeMinimum = stakeManager.getStakeMinimum();
        require(stake >= stakeMinimum, "Stake amount is below minimum");
        address provider = msg.sender;
        bool success = computeRegistry.register(provider);
        require(success, "Provider registration failed");
        
        // Transfer native INJ to stake manager
        (bool sent, ) = address(stakeManager).call{value: stake}(
            abi.encodeWithSignature("stake(address,uint256)", provider, stake)
        );
        require(sent, "Failed to stake INJ");
        
        emit ProviderRegistered(provider, stake);
    }

    function increaseStake() external payable {
        address provider = msg.sender;
        uint256 amount = msg.value;
        require(computeRegistry.checkProviderExists(provider), "Provider not registered");
        
        // Transfer native INJ to stake manager
        (bool sent, ) = address(stakeManager).call{value: amount}(
            abi.encodeWithSignature("stake(address,uint256)", provider, amount)
        );
        require(sent, "Failed to stake INJ");
    }

    function reclaimStake(uint256 amount) external {
        address provider = msg.sender;
        uint256 providerStake = stakeManager.getStake(provider);
        uint256 minComputeStake = calculateMinimumStake(provider, 0);
        require(providerStake - amount >= minComputeStake, "Cannot unstake more than unallocated stake");
        // if amount is 0, unstake all that is currently not allocated to compute units
        if (amount == 0) {
            amount = providerStake - minComputeStake;
        }
        stakeManager.unstake(provider, amount);
    }

    function deregisterProvider(address provider) external {
        require(hasRole(VALIDATOR_ROLE, msg.sender) || msg.sender == provider, "Unauthorized");
        require(computeRegistry.getProviderActiveNodes(provider) == 0, "Provider has active nodes");
        computeRegistry.deregister(provider);
        uint256 stake = stakeManager.getStake(provider);
        stakeManager.unstake(provider, stake);
        emit ProviderDeregistered(provider);
    }

    function addComputeNode(address nodekey, string calldata specsURI, uint256 computeUnits, bytes memory signature)
        external
    {
        address provider = msg.sender;
        // check provider exists
        require(computeRegistry.checkProviderExists(provider), "Provider not registered");
        require(computeRegistry.getWhitelistStatus(provider), "Provider not whitelisted");
        require(_verifyNodekeySignature(provider, nodekey, signature), "Invalid signature");
        uint256 requiredStake = calculateMinimumStake(provider, computeUnits);
        uint256 providerStake = stakeManager.getStake(provider);
        require(providerStake >= requiredStake, "Insufficient stake");
        computeRegistry.addComputeNode(provider, nodekey, computeUnits, specsURI);
        emit ComputeNodeAdded(provider, nodekey, specsURI);
    }

    function _removeComputeNode(address provider, address nodekey) internal {
        computeRegistry.removeComputeNode(provider, nodekey);
        emit ComputeNodeRemoved(provider, nodekey);
    }

    function removeComputeNode(address provider, address nodekey) external {
        require(hasRole(VALIDATOR_ROLE, msg.sender) || msg.sender == provider, "Unauthorized");
        _removeComputeNode(provider, nodekey);
    }

    function _blacklistIfStakeTooLow(address provider) internal {
        if (stakeManager.getStake(provider) < calculateMinimumStake(provider, 0)) {
            computeRegistry.setWhitelistStatus(provider, false);
            emit ProviderBlacklisted(provider);
        }
    }

    function slash(address provider, uint256 amount, bytes calldata reason) external onlyRole(VALIDATOR_ROLE) {
        uint256 slashed = stakeManager.slash(provider, amount, reason);
        // Transfer slashed INJ to validator
        (bool sent, ) = msg.sender.call{value: slashed}("");
        require(sent, "Failed to transfer slashed INJ");
    }

    function invalidateWork(uint256 poolId, uint256 penalty, bytes calldata data) external onlyRole(VALIDATOR_ROLE) {
        (address provider, address node) = computePool.invalidateWork(poolId, data);
        try stakeManager.slash(provider, penalty, data) returns (uint256 slashedAmount) {
            // Transfer slashed INJ to validator
            (bool sent, ) = msg.sender.call{value: slashedAmount}("");
            require(sent, "Failed to transfer slashed INJ");
        } catch {
            // if slashing failed for whatever reason, blacklist provider to make sure they can't submit more work
            computeRegistry.setWhitelistStatus(provider, false);
            emit ProviderBlacklisted(provider);
        }
        // if node is still in registry, invalidate it
        // to queue it for reverification by the validator
        // Note: we use try here because it's more gas efficient
        // than an extra contract call just to check existence
        try computeRegistry.setNodeValidationStatus(provider, node, false) {
            emit ComputeNodeInvalidated(provider, node);
            // just be extra safe so that this doesn't revert if node is in a different pool
        } catch {}

        try computeRegistry.removeComputeNode(provider, node) {
            emit ComputeNodeRemoved(provider, node);
        } catch {}
    }

    function softInvalidateWork(uint256 poolId, bytes calldata data)
        external
        onlyRole(VALIDATOR_ROLE)
        returns (address, address, uint256)
    {
        (address provider, address node, uint256 workUnits) = computePool.softInvalidateWork(poolId, data);
        // Note: No slashing, no node invalidation, no blacklisting - just remove the work
        return (provider, node, workUnits);
    }

    function _verifyNodekeySignature(address provider, address nodekey, bytes memory signature)
        internal
        view
        returns (bool)
    {
        bytes32 messageHash = keccak256(abi.encodePacked(provider, nodekey)).toEthSignedMessageHash();
        return SignatureChecker.isValidSignatureNow(nodekey, messageHash, signature);
    }

    function calculateMinimumStake(address provider, uint256 computeUnits) public view returns (uint256) {
        uint256 providerTotalCompute = computeRegistry.getProviderTotalCompute(provider);
        uint256 minStakePerComputeUnit = stakeManager.getStakeMinimum();
        uint256 requiredStake = (providerTotalCompute + computeUnits) * minStakePerComputeUnit;
        // add minStakePerComputeUnit to account for the provider's base stake
        return requiredStake + minStakePerComputeUnit;
    }

    // Allow contract to receive INJ
    receive() external payable {}
    fallback() external payable {}
}