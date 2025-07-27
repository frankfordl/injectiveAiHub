# InjectiveAiHub - 基于Injective的去中心化AI协作平台

<div align="center">
<img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
<img src="https://img.shields.io/badge/Foundry-000000?style=for-the-badge&logo=foundry&logoColor=white" alt="Foundry" />
<img src="https://img.shields.io/badge/Injective-000000?style=for-the-badge&logo=injective&logoColor=white" alt="Injective" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
<img src="https://img.shields.io/badge/LLaMA-FF6B6B?style=for-the-badge&logo=meta&logoColor=white" alt="LLaMA" />
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
- 🦙 **LLaMA 2 7B训练**: 集成大语言模型分布式训练

## 📁 项目结构

```
<File can be used for the pnpm dev command and the LLamacore module.>
injectiveAiHub/
├── apps/
│   ├── frontend/          # Next.js前端应用
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── ...
│   └── inj_t/            # Foundry智能合约项目
│       ├── src/          # 智能合约源码
│       ├── test/         # 合约测试
│       ├── script/       # 部署脚本
│       └── foundry.toml
└── llamacore/            # LLaMA 2 7B分布式训练模块
├── task.py           # 训练任务定义
├── data.py           # 数据处理
├── arguments.py      # 训练参数
├── run_trainer.py    # 训练启动脚本
├── inference/        # 推理模块
└── lib/              # 训练库

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

## 🦙 LlamaCore - 分布式AI训练模块

### 模块概述

LlamaCore是InjectiveAiHub的核心AI训练模块，专门用于LLaMA 2 7B大语言模型的分布式协作训练。该模块基于Hivemind框架实现去中心化的联邦学习，支持多节点协作训练。

### 🎯 核心特性

- 🤖 **LLaMA 2 7B模型**: 支持Meta的LLaMA 2 7B参数大语言模型
- 🌐 **分布式训练**: 基于Hivemind的去中心化协作训练
- 📊 **OpenWebText数据集**: 使用高质量文本数据进行训练
- 🔐 **隐私保护**: 隐藏节点IP和身份信息
- ⚡ **高效训练**: 支持FP16混合精度训练
- 🎛️ **灵活配置**: 可配置的训练参数和网络设置

### 📁 模块结构
llamacore/
├── task.py              # 训练任务定义和模型配置
├── data.py              # 数据加载和预处理
├── arguments.py         # 训练参数和网络配置
├── run_trainer.py       # 主训练脚本
├── run_aux_peer.py      # 辅助节点脚本
├── callback.py          # 训练回调函数
├── utils.py             # 工具函数
├── requirements.txt     # Python依赖
├── inference/           # 推理模块
│   └── run_inference.py # 文本生成推理脚本
└── lib/                 # 训练库
└── training/
└── hf_trainer.py # Hugging Face训练器适配

### 🚀 快速开始

#### 环境要求

- **Python** >= 3.8
- **PyTorch** >= 1.12.0
- **CUDA** >= 11.6 (GPU训练)
- **Transformers** >= 4.21.0
- **Hivemind** >= 1.1.0

#### 安装依赖

```bash
cd llamacore
pip install -r requirements.txt
```

#### Hugging Face认证

```bash
# 设置Hugging Face访问令牌
export HUGGINGFACE_TOKEN="your_token_here"

# 或使用huggingface-cli登录
huggingface-cli login
```

#### 启动训练

```bash
# 启动主训练节点
python run_trainer.py \
    --experiment_prefix "llama2-7b-training" \
    --per_device_train_batch_size 1 \
    --gradient_accumulation_steps 16 \
    --learning_rate 1e-5 \
    --fp16 \
    --total_steps 10000

# 启动辅助训练节点
python run_aux_peer.py \
    --experiment_prefix "llama2-7b-training" \
    --host_maddrs "/ip4/127.0.0.1/tcp/0"
```

#### 文本生成推理

```bash
# 创建提示文件
echo "人工智能的未来发展趋势是" > prompts.txt
echo "区块链技术在金融领域的应用包括" >> prompts.txt

# 运行推理
python inference/run_inference.py \
    --prompts prompts.txt \
    --output-dir ./outputs \
    --max-length 512 \
    --temperature 0.7
```

### ⚙️ 配置说明

#### 训练参数配置

```python
# arguments.py 中的关键参数
class TrainingArguments:
    per_device_train_batch_size: int = 1      # 每设备批次大小
    gradient_accumulation_steps: int = 16     # 梯度累积步数
    learning_rate: float = 1e-5               # 学习率
    text_seq_length: int = 2048               # 文本序列长度
    total_steps: int = 10000                  # 总训练步数
    warmup_steps: int = 500                   # 预热步数
    fp16: bool = True                         # 混合精度训练
```

#### 网络配置

```python
# 隐私保护配置
class BasePeerArguments:
    host_maddrs: List[str] = ["/ip4/127.0.0.1/tcp/0"]  # 只监听本地
    announce_maddrs: List[str] = []                      # 不公布地址
    client_mode: bool = True                             # 客户端模式
```

### 📊 训练监控

#### 日志输出

```bash
# 训练过程中的关键日志
[INFO] 模型加载完成: LlamaForCausalLM
[INFO] 数据集加载完成: openwebtext (样本数: 1000000)
[INFO] DHT网络连接成功
[INFO] 开始协作训练...
[INFO] Step 100/10000, Loss: 2.45, LR: 1e-5
```

#### 性能指标

- **训练速度**: ~0.5 steps/sec (单GPU)
- **内存使用**: ~14GB VRAM (FP16)
- **网络带宽**: ~10MB/s (梯度同步)
- **模型大小**: ~13GB (7B参数)

### 🔧 高级配置

#### 自定义数据集

```python
# data.py 中修改数据集
def make_dataset(tokenizer, args):
    # 替换为自定义数据集
    dataset = load_dataset("your_custom_dataset")
    # ... 数据预处理逻辑
    return dataset
```

#### 模型微调

```python
# task.py 中的模型配置
class ModelWrapper:
    def __init__(self):
        self.model = LlamaForCausalLM.from_pretrained(
            "meta-llama/Llama-2-7b-hf",
            torch_dtype=torch.float16,
            device_map="auto"
        )
```

## 🚀 完整部署指南

### 环境要求

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Foundry** >= 0.2.0
- **Python** >= 3.8
- **Git**
- **Injective钱包** (Keplr, Leap等)

### 1. 克隆和初始化项目

```bash
# 克隆仓库
git clone https://github.com/your-org/injectiveAiHub.git
cd injectiveAiHub

# 安装pnpm (如果未安装)
npm install -g pnpm
```

### 2. 智能合约部署

```bash
# 进入合约目录
cd apps/inj_t

# 安装Foundry依赖
forge install

# 编译合约
forge build

# 运行测试
forge test

# 部署到Injective测试网
forge script script/Deploy.s.sol \
    --rpc-url $INJECTIVE_TESTNET_RPC \
    --private-key $PRIVATE_KEY \
    --broadcast

# 部署到Injective主网
forge script script/Deploy.s.sol \
    --rpc-url $INJECTIVE_MAINNET_RPC \
    --private-key $PRIVATE_KEY \
    --broadcast
```

### 3. 前端应用部署

```bash
# 返回项目根目录
cd ../..

# 进入前端目录
cd apps/frontend

# 安装依赖 (使用pnpm)
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，配置以下变量：
# NEXT_PUBLIC_INJECTIVE_NETWORK=testnet
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
# NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

#### 环境变量配置

```bash
# .env.local 示例
NEXT_PUBLIC_INJECTIVE_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef...
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

#### 启动开发服务器

```bash
# 启动前端开发服务器
pnpm dev

# 或者指定端口
pnpm dev --port 3001

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

#### 前端功能特性

- 🔗 **钱包连接**: 支持Keplr、Leap等Injective钱包
- 💰 **质押管理**: 可视化质押、增加质押、取回质押
- 🖥️ **节点管理**: 添加、查看、管理计算节点
- 📊 **仪表板**: 实时显示网络状态和个人贡献
- 🎯 **任务创建**: 创建和管理AI训练任务
- 🏆 **奖励查看**: 查看和领取训练奖励

### 4. LlamaCore AI训练模块部署

```bash
# 返回项目根目录
cd ../..

# 进入LlamaCore目录
cd llamacore

# 创建Python虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装Python依赖
pip install -r requirements.txt

# 配置Hugging Face认证
export HUGGINGFACE_TOKEN="your_huggingface_token"
# 或使用
huggingface-cli login
```

#### 启动AI训练节点

```bash
# 启动主训练节点
python run_trainer.py \
    --experiment_prefix "llama2-7b-training" \
    --per_device_train_batch_size 1 \
    --gradient_accumulation_steps 16 \
    --learning_rate 1e-5 \
    --fp16 \
    --total_steps 10000 \
    --warmup_steps 500

# 在另一个终端启动辅助节点
python run_aux_peer.py \
    --experiment_prefix "llama2-7b-training" \
    --host_maddrs "/ip4/127.0.0.1/tcp/0"
```

#### AI推理服务

```bash
# 创建推理提示文件
echo "人工智能的未来发展方向包括" > prompts.txt
echo "区块链技术的主要优势是" >> prompts.txt
echo "分布式机器学习的挑战有" >> prompts.txt

# 运行文本生成推理
python inference/run_inference.py \
    --prompts prompts.txt \
    --output-dir ./inference_outputs \
    --max-length 512 \
    --temperature 0.7 \
    --top-p 0.9 \
    --num-samples 3
```

### 5. 完整系统启动

#### 开发环境启动脚本

```bash
#!/bin/bash
# start_dev.sh

echo "🚀 启动InjectiveAiHub开发环境..."

# 启动前端开发服务器
echo "📱 启动前端服务器..."
cd apps/frontend
pnpm dev --port 3000 &
FRONTEND_PID=$!

# 启动LlamaCore训练节点
echo "🤖 启动AI训练节点..."
cd ../../llamacore
source venv/bin/activate
python run_trainer.py \
    --experiment_prefix "dev-llama2-training" \
    --per_device_train_batch_size 1 \
    --gradient_accumulation_steps 8 \
    --learning_rate 1e-5 \
    --fp16 \
    --total_steps 1000 &
TRAINER_PID=$!

echo "✅ 所有服务已启动"
echo "📱 前端地址: http://localhost:3000"
echo "🤖 AI训练节点PID: $TRAINER_PID"
echo "📱 前端服务PID: $FRONTEND_PID"

# 等待用户输入以停止服务
read -p "按Enter键停止所有服务..."

echo "🛑 停止所有服务..."
kill $FRONTEND_PID $TRAINER_PID
echo "✅ 所有服务已停止"
```

#### 生产环境部署

```bash
# 构建前端生产版本
cd apps/frontend
pnpm build

# 使用PM2管理Node.js进程
npm install -g pm2
pm2 start ecosystem.config.js

# 使用systemd管理LlamaCore训练服务
sudo cp llamacore.service /etc/systemd/system/
sudo systemctl enable llamacore
sudo systemctl start llamacore
```

## 🧪 智能合约测试

### 测试套件

```bash
# 进入合约目录
cd apps/inj_t

# 运行所有测试
forge test

# 运行特定测试文件
forge test --match-path test/InjectiveAiHub.t.sol

# 运行特定测试函数
forge test --match-test testRegisterProvider

# 生成测试覆盖率报告
forge coverage

# 详细测试输出
forge test -vvv
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

### AI训练安全

- 🔐 **隐私保护**: 联邦学习保护数据隐私
- 🛡️ **模型验证**: 防止恶意模型更新
- 🔍 **梯度审计**: 检测异常梯度提交
- ⚡ **拜占庭容错**: 容忍部分恶意节点

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
# 合约测试
cd apps/inj_t && forge test

# 前端测试
cd apps/frontend && pnpm test

# AI模块测试
cd llamacore && python -m pytest
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
- 🐍 **Python风格**: 遵循PEP 8代码规范
- ⚛️ **React风格**: 遵循React和TypeScript最佳实践

## 📚 文档和资源

### 技术文档

- [智能合约API文档](./docs/contracts/)
- [前端集成指南](./docs/frontend/)
- [LlamaCore训练指南](./docs/llamacore/)
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
- [Meta AI](https://ai.meta.com/) - LLaMA 2模型
- [Hivemind](https://github.com/learning-at-home/hivemind) - 分布式训练框架
- [Hugging Face](https://huggingface.co/) - Transformers库和模型托管
- 开源社区的所有贡献者

---

<div align="center">
<p>🚀 由InjectiveAiHub团队用❤️构建</p>
<p>🌟 通过区块链技术赋能协作式AI</p>
<p>🦙 让AI训练更加民主化和去中心化</p>
</div>