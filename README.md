# InjectiveAiHub - 基于Injective的去中心化AI协作平台

<div align="center">
<img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
<img src="https://img.shields.io/badge/Foundry-000000?style=for-the-badge&logo=foundry&logoColor=white" alt="Foundry" />
<img src="https://img.shields.io/badge/Injective-000000?style=for-the-badge&logo=injective&logoColor=white" alt="Injective" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
</div>

## 🏗️ 项目概述

InjectiveAiHub是一个基于Injective区块链的去中心化AI协作训练平台，通过智能合约实现透明、公平的分布式机器学习生态系统。平台使用原生INJ代币作为质押和奖励机制，确保网络安全和参与者激励。

### 🎯 核心特性

- 🔗 **完全去中心化**: 基于Injective智能合约的无信任协作
- 💎 **原生INJ质押**: 使用Injective原生代币进行质押和奖励
- 🤖 **分布式AI训练**: 多方协作的联邦学习架构
- 🛡️ **安全保障**: 智能合约驱动的质押和惩罚机制
- 📊 **透明治理**: 链上投票和社区决策
- 🔐 **隐私保护**: 联邦学习保护数据隐私

## 🏛️ 智能合约架构

### 核心合约系统

#### 1. InjectiveAiHub.sol - 主合约
**功能**: 平台核心管理合约，处理提供者注册、节点验证和质押管理

**主要功能**:
- 🔐 **提供者注册**: 使用INJ质押注册计算资源提供者
- ✅ **节点验证**: 验证者角色验证计算节点
- 💰 **质押管理**: INJ质押、增加质押、取回质押
- ⚡ **惩罚机制**: 对恶意行为进行质押惩罚
- 🏷️ **白名单管理**: 提供者白名单和黑名单管理

```solidity
// 核心功能示例
function registerProvider() external payable {
    uint256 stake = msg.value;
    require(stake >= stakeMinimum, "质押金额低于最低要求");
    // 注册逻辑...
}

function addComputeNode(address nodekey, string calldata specsURI, uint256 computeUnits, bytes memory signature) external {
    // 添加计算节点逻辑...
}
```

#### 2. ComputeRegistry.sol - 计算资源注册表
**功能**: 管理计算资源提供者和节点信息

**主要功能**:
- 📋 **提供者管理**: 注册、注销计算资源提供者
- 🖥️ **节点管理**: 添加、移除、验证计算节点
- 📊 **资源统计**: 跟踪提供者的总计算单元
- 🔍 **状态查询**: 查询提供者和节点状态

#### 3. StakeManager.sol - 质押管理器
**功能**: 处理INJ代币的质押、解质押和惩罚

**主要功能**:
- 💎 **INJ质押**: 接收和管理原生INJ质押
- 🔓 **解质押**: 处理质押解锁和提取
- ⚖️ **惩罚执行**: 对违规行为执行质押惩罚
- ⏰ **解绑期管理**: 管理质押解绑等待期

#### 4. ComputePool.sol - 计算池管理
**功能**: 管理AI训练任务的计算池

**主要功能**:
- 🎯 **任务创建**: 创建AI训练计算池
- 👥 **参与者管理**: 管理计算池参与者
- 📈 **进度跟踪**: 跟踪训练进度和贡献
- 🏆 **奖励分配**: 基于贡献分配奖励

#### 5. DomainRegistry.sol - 领域注册表
**功能**: 管理不同AI训练领域和验证逻辑

**主要功能**:
- 🏷️ **领域创建**: 创建新的AI训练领域
- 🔧 **验证逻辑**: 管理领域特定的工作验证
- 📝 **元数据管理**: 存储领域描述和参数

#### 6. RewardsDistributor.sol - 奖励分配器
**功能**: 管理基于贡献的INJ奖励分配

**主要功能**:
- 💰 **奖励计算**: 基于工作贡献计算奖励
- 📊 **分配管理**: 管理奖励分配策略
- 🎁 **奖励领取**: 处理参与者奖励领取

### 🔐 权限和角色系统

```solidity
// 角色定义
bytes32 public constant FEDERATOR_ROLE = keccak256("FEDERATOR_ROLE");  // 联邦者角色
bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");  // 验证者角色
bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;                    // 管理员角色
```

**角色权限**:
- 🔑 **管理员**: 设置模块地址、管理系统配置
- 👑 **联邦者**: 创建领域、设置质押最低要求、管理验证者
- ✅ **验证者**: 验证节点、执行惩罚、管理白名单

### 💎 INJ质押机制

#### 质押要求
```solidity
function calculateMinimumStake(address provider, uint256 computeUnits) public view returns (uint256) {
    uint256 providerTotalCompute = computeRegistry.getProviderTotalCompute(provider);
    uint256 minStakePerComputeUnit = stakeManager.getStakeMinimum();
    uint256 requiredStake = (providerTotalCompute + computeUnits) * minStakePerComputeUnit;
    return requiredStake + minStakePerComputeUnit; // 基础质押 + 计算单元质押
}
```

#### 质押流程
1. **注册质押**: 提供者使用INJ注册并质押
2. **增加质押**: 根据需要增加更多计算单元的质押
3. **质押验证**: 验证者确认质押满足要求
4. **惩罚机制**: 恶意行为导致质押被惩罚
5. **取回质押**: 遵循解绑期后取回质押

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **Foundry** >= 0.2.0
- **Git**
- **Injective钱包** (Keplr, Leap等)

### 安装和部署

1. **克隆仓库**
```bash
git clone https://github.com/your-org/injectiveAiHub.git
cd injectiveAiHub
```

2. **安装智能合约依赖**
```bash
cd apps/inj_t
forge install
```

3. **编译合约**
```bash
forge build
```

4. **运行测试**
```bash
forge test
```

5. **部署合约**
```bash
# 部署到Injective测试网
forge script script/Deploy.s.sol --rpc-url $INJECTIVE_TESTNET_RPC --private-key $PRIVATE_KEY --broadcast

# 部署到Injective主网
forge script script/Deploy.s.sol --rpc-url $INJECTIVE_MAINNET_RPC --private-key $PRIVATE_KEY --broadcast
```

### 前端应用

1. **安装前端依赖**
```bash
cd apps/frontend
npm install
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑.env文件，配置合约地址和网络参数
```

3. **启动开发服务器**
```bash
npm run dev
```

## 🧪 智能合约测试

### 测试套件

```bash
# 运行所有测试
forge test

# 运行特定测试文件
forge test --match-path test/InjectiveAiHub.t.sol

# 运行特定测试函数
forge test --match-test testRegisterProvider

# 生成测试覆盖率报告
forge coverage
```

### 测试用例覆盖

- ✅ **提供者注册和质押**
- ✅ **计算节点添加和验证**
- ✅ **质押增加和取回**
- ✅ **惩罚机制执行**
- ✅ **权限和角色管理**
- ✅ **奖励分配逻辑**
- ✅ **边界条件和错误处理**

## 📊 合约交互示例

### 1. 注册为计算提供者

```javascript
// 使用Web3.js或ethers.js
const tx = await injectiveAiHub.registerProvider({
    value: ethers.utils.parseEther("100") // 质押100 INJ
});
```

### 2. 添加计算节点

```javascript
const signature = await signNodeKey(provider, nodekey);
const tx = await injectiveAiHub.addComputeNode(
    nodekey,
    "ipfs://QmSpecsURI",
    10, // 10个计算单元
    signature
);
```

### 3. 创建AI训练领域

```javascript
const tx = await injectiveAiHub.createDomain(
    "图像识别",
    validationLogicAddress,
    "ipfs://QmDomainURI"
);
```

## 🔧 配置和部署

### 网络配置

```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]

[rpc_endpoints]
injective_testnet = "https://testnet.sentry.tm.injective.network:443"
injective_mainnet = "https://sentry.tm.injective.network:443"
```

### 部署脚本

```solidity
// script/Deploy.s.sol
contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        
        // 部署核心合约
        InjectiveAiHub hub = new InjectiveAiHub(federator, validator);
        ComputeRegistry registry = new ComputeRegistry();
        StakeManager stakeManager = new StakeManager();
        
        // 设置合约地址
        hub.setModuleAddresses(
            address(registry),
            address(domainRegistry),
            address(stakeManager),
            address(computePool)
        );
        
        vm.stopBroadcast();
    }
}
```

## 📈 经济模型

### INJ代币用途

1. **质押保证金**: 提供者需要质押INJ作为服务保证
2. **网络费用**: 支付交易和计算费用
3. **奖励分配**: 基于贡献获得INJ奖励
4. **治理投票**: 使用质押的INJ参与平台治理

### 奖励机制

- 📊 **工作贡献奖励**: 基于提交的有效工作量
- ⏰ **在线时间奖励**: 基于节点在线时间
- 🎯 **质量奖励**: 基于工作质量评估
- 🏆 **长期激励**: 长期参与者获得额外奖励

## 🛡️ 安全特性

### 智能合约安全

- 🔐 **访问控制**: 基于角色的权限管理
- 🛡️ **重入保护**: 防止重入攻击
- ✅ **输入验证**: 严格的参数验证
- 🔍 **事件日志**: 完整的操作审计日志

### 经济安全

- 💎 **质押机制**: 经济激励确保诚实行为
- ⚖️ **惩罚机制**: 对恶意行为进行经济惩罚
- 🕐 **解绑期**: 防止快速退出攻击
- 📊 **动态调整**: 根据网络状况调整参数

## 🤝 贡献指南

### 开发流程

1. **Fork仓库**
2. **创建功能分支**
```bash
git checkout -b feature/new-feature
```
3. **编写代码和测试**
4. **运行测试套件**
```bash
forge test
npm test
```
5. **提交更改**
```bash
git commit -m "feat: 添加新功能"
```
6. **创建Pull Request**

### 代码规范

- 📝 **Solidity风格**: 遵循Solidity官方风格指南
- 🧪 **测试覆盖**: 新功能必须包含测试
- 📚 **文档更新**: 更新相关文档
- 🔍 **代码审查**: 所有PR需要代码审查

## 📚 文档和资源

### 技术文档

- [智能合约API文档](./docs/contracts/)
- [前端集成指南](./docs/frontend/)
- [部署指南](./docs/deployment/)
- [安全最佳实践](./docs/security/)

### 社区资源

- 🐛 **问题报告**: [GitHub Issues](https://github.com/your-org/injectiveAiHub/issues)
- 💬 **讨论区**: [GitHub Discussions](https://github.com/your-org/injectiveAiHub/discussions)
- 📧 **邮件支持**: support@injectiveaihub.ai
- 💭 **Discord社区**: [加入我们](https://discord.gg/injectiveaihub)

## 📄 许可证

本项目采用MIT许可证 - 查看[LICENSE](LICENSE)文件了解详情。

## 🙏 致谢

- [Injective Labs](https://injective.com/) - 提供区块链基础设施
- [Foundry](https://getfoundry.sh/) - 智能合约开发工具
- [OpenZeppelin](https://openzeppelin.com/) - 安全的智能合约库
- 开源社区的所有贡献者

---

<div align="center">
<p>🚀 由InjectiveAiHub团队用❤️构建</p>
<p>🌟 通过区块链技术赋能协作式AI</p>
</div>
