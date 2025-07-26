# InjectiveAIHub - Collaborative AI Training Platform on Injective

<div align="center">
< img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
< img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
< img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
< img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
< img src="https://img.shields.io/badge/Injective-000000?style=for-the-badge&logo=injective&logoColor=white" alt="Injective" />
</div>

##  Overview

InjectiveAIHub is a revolutionary collaborative AI training platform built on the Injective blockchain. It enables distributed machine learning where participants can contribute data, computational resources, and expertise while being fairly rewarded through blockchain-based incentives.

### Key Features

- 🤖 **Collaborative AI Training**: Distributed machine learning with multiple participants
- 🔗 **Blockchain Integration**: Built on Injective for transparency and fair rewards
-  **Tokenized Incentives**: Earn tokens for contributing data, compute, and expertise
-  **Privacy-Preserving**: Federated learning ensures data privacy
-  **Real-time Monitoring**: Track training progress and model performance
- 🌐 **Web3 Integration**: Seamless wallet connection and blockchain interactions
-  **Modern UI/UX**: Responsive design with dark/light mode support


##  Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Git**
- **Foundry** (for smart contracts)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/BytebunnyLabs/injectiveaihub.git
cd injectiveaihub
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd apps/frontend
npm install

# Install smart contract dependencies
cd ../inj_t
forge install
```

3. **Start development servers**
```bash
# Start frontend
cd apps/frontend
npm run dev # Frontend at http://localhost:3000

# Build smart contracts
cd apps/inj_t
forge build
```

##  Available Scripts

### Frontend Development
```bash
cd apps/frontend
npm run dev # Start development server
npm run build # Build for production
npm run start # Start production server
npm run lint # Run linting
```

### Smart Contract Development
```bash
cd apps/inj_t
forge build # Compile contracts
forge test # Run contract tests
forge script script/CreateHub.s.sol # Deploy contracts
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` in the frontend directory and configure:

```bash
cd apps/frontend
cp .env.example .env
```

Key configuration sections:
- **Injective**: Blockchain network configuration
- **Wallet**: Web3 wallet integration
- **API**: Backend service endpoints

### Development Setup

1. Installing dependencies
2. Setting up environment variables
3. Configuring Injective network
4. Setting up wallet connections

## 🏛️ Smart Contracts

The platform uses Solidity smart contracts on Injective for:

- **AI Hub Management**: Manage collaborative training hubs
- **Compute Registry**: Track computational resource contributions
- **Rewards**: Distribute tokens based on contributions
- **Governance**: Community voting on platform decisions

### Contract Development

```bash
cd apps/inj_t
forge build # Compile contracts
forge test # Run contract tests
forge script script/CreateHub.s.sol # Deploy to network
```

### Key Contracts

- **AIHubManager.sol**: Main hub management contract
- **ComputeRegistry.sol**: Computational resource tracking

## 🧪 Testing

Comprehensive testing setup with:

- **Unit Tests**: Jest for frontend components
- **Contract Tests**: Foundry for smart contract testing
- **E2E Tests**: End-to-end user flow testing

### Running Tests

```bash
# Frontend tests
cd apps/frontend
npm test

# Smart contract tests
cd apps/inj_t
forge test
```

##  Applications

### Frontend Application

**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Injective Wallet Integration

**Features**:
- Modern responsive UI with dark/light mode
- Injective wallet integration with multiple wallet support
- Real-time training session monitoring
- Contributor dashboard and profile management
- Token reward tracking and history

**Development**:
```bash
cd apps/frontend
npm run dev
```

### Smart Contracts (inj_t)

**Tech Stack**: Solidity, Foundry, Injective Protocol

**Features**:
- AI Hub management smart contracts
- Compute resource registry
- Reward distribution mechanisms
- Governance and voting systems

**Development**:
```bash
cd apps/inj_t
forge build
forge test
```

##  Deployment

### Frontend Deployment

1. **Build the application**
```bash
cd apps/frontend
npm run build
```

2. **Deploy to Vercel or your preferred platform**

### Smart Contract Deployment

1. **Configure network settings**
2. **Deploy contracts**
```bash
cd apps/inj_t
forge script script/CreateHub.s.sol --rpc-url <INJECTIVE_RPC_URL> --private-key <PRIVATE_KEY>
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```
3. **Make your changes**
4. **Run tests**
```bash
# Test frontend
cd apps/frontend && npm test

# Test contracts
cd apps/inj_t && forge test
```
5. **Commit your changes**
```bash
git commit -m 'Add amazing feature'
```
6. **Push to the branch**
```bash
git push origin feature/amazing-feature
```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure all tests pass
- Update documentation as needed

##  Documentation

- [Frontend Guide](./apps/frontend/README.md)
- [Smart Contracts Guide](./apps/inj_t/README.md)
- [Integration Guide](./INTEGRATION.md)
- [Deployment Guide](./docs/deployment.md)

## 🛡️ Security

- **Smart Contract Audits**: Regular security reviews
- **Dependency Scanning**: Automated vulnerability checks
- **Access Control**: Role-based permissions
- **Data Encryption**: Secure data handling

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [Injective Labs](https://injective.com/) for the blockchain infrastructure
- [Next.js](https://nextjs.org/) for the frontend framework
- [Foundry](https://getfoundry.sh/) for smart contract development
- The open-source community for amazing tools and libraries

##  Support

- **Issues**: [GitHub Issues](https://github.com/BytebunnyLabs/injectiveaihub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/BytebunnyLabs/injectiveaihub/discussions)
- **Email**: support@injectiveaihub.ai
- **Discord**: [Join our community](https://discord.gg/injectiveaihub)

---

<div align="center">
<p>Built with ️ by the InjectiveAIHub Team</p >
<p>Empowering collaborative AI through blockchain technology</p >
</div>
