# FairPlay Nexus

**Provably Fair Gaming and DeFi Yield, Powered by Blockchain**

A comprehensive Base mini-app and web platform for fair, on-chain verified game draws and P2P crypto lending with collateral management.

## 🚀 Features

### 🎮 Provably Fair Gaming
- **On-Chain Verified Game Draws**: Lotteries, raffles, and tournaments with Chainlink VRF
- **NFT-Based Ticketing**: Game entries as unique, transferable NFTs
- **Transparent Outcomes**: Every game result is verifiably random and tamper-proof

### 💰 DeFi Lending Marketplace
- **P2P Crypto Lending**: Borrow and lend crypto assets securely
- **Smart Contract Collateral**: Automated collateral management and liquidation
- **Interest Rate Discovery**: Dynamic pricing based on supply and demand

### 🏆 Reputation System
- **On-Chain Reputation**: Build trust through successful transactions
- **Multi-Level Tiers**: Bronze → Silver → Gold → Platinum → Diamond
- **Activity Tracking**: Games played, loans given/repaid, overall reliability

### 🎨 Modern UI/UX
- **Base Mini-App**: Seamless integration with Coinbase Wallet
- **Responsive Design**: Works on desktop and mobile
- **Real-Time Updates**: Live blockchain data synchronization

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Base Network, Solidity, Chainlink VRF
- **Smart Contracts**: OpenZeppelin, Hardhat
- **Storage**: IPFS (Infura)
- **Wallet**: OnchainKit, MetaMask, Coinbase Wallet
- **Backend**: Next.js API Routes

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or Coinbase Wallet
- Base network access

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd fairplay-nexus
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
```env
# Base Network
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Contract Addresses (after deployment)
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=
NEXT_PUBLIC_LENDING_CONTRACT_ADDRESS=
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS=

# VRF Configuration
NEXT_PUBLIC_VRF_SUBSCRIPTION_ID=

# IPFS (Infura)
NEXT_PUBLIC_INFURA_PROJECT_ID=
NEXT_PUBLIC_INFURA_PROJECT_SECRET=

# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
```

### 3. Deploy Smart Contracts

```bash
# Compile contracts
npm run contracts:compile

# Deploy to Base (configure your private key in .env)
npm run contracts:deploy
```

Update your `.env.local` with the deployed contract addresses.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Smart Contract Architecture

### Core Contracts

1. **GameDraw.sol**: Manages game creation, entries, and VRF-powered draws
2. **TicketNFT.sol**: ERC721 implementation for game entry tickets
3. **LendingMarketplace.sol**: P2P lending with collateral management
4. **ReputationSystem.sol**: On-chain reputation tracking

### Deployment Order

1. Deploy ReputationSystem
2. Deploy TicketNFT
3. Deploy LendingMarketplace
4. Deploy GameDraw (requires VRF subscription)

## 🎯 Usage

### For Gamers
1. Connect your wallet
2. Browse active games
3. Enter games by minting NFT tickets
4. View your ticket collection
5. Claim prizes for winning games

### For Lenders
1. Connect your wallet
2. Create loan offers or browse marketplace
3. Fund loans with automatic collateral management
4. Earn interest on lent assets
5. Monitor loan performance

### For Borrowers
1. Connect your wallet
2. Deposit collateral
3. Request loans with competitive rates
4. Use borrowed funds
5. Repay loans to maintain reputation

## 🔧 API Endpoints

### Games
- `GET /api/games?action=active` - Get active games
- `GET /api/games?action=user&userAddress=0x...` - Get user's games
- `POST /api/games` - Create new game

### Loans
- `GET /api/loans?action=user-loans&userAddress=0x...` - Get user loans
- `GET /api/loans?action=active-offers` - Get active loan offers
- `POST /api/loans` - Create loan request/offer

### NFTs
- `GET /api/nfts?action=user-tickets&userAddress=0x...` - Get user tickets
- `POST /api/nfts` - Mint new ticket

### User
- `GET /api/user?action=reputation&address=0x...` - Get user reputation
- `POST /api/user` - Record user activity

## 🧪 Testing

```bash
# Run contract tests
npm run contracts:test

# Run frontend tests (when implemented)
npm run test
```

## 🚀 Deployment

### Smart Contracts
```bash
npm run contracts:deploy
```

### Frontend
```bash
npm run build
npm run start
```

## 🔒 Security

- **Audited Contracts**: All smart contracts use OpenZeppelin battle-tested implementations
- **Chainlink VRF**: Provably fair randomness for game outcomes
- **Collateral Management**: Automated liquidation protection
- **Access Control**: Role-based permissions on sensitive operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: Create GitHub issues
- **Discord**: Join our community

## 🙏 Acknowledgments

- **Base Network**: For the excellent L2 infrastructure
- **Chainlink**: For VRF and oracle services
- **OpenZeppelin**: For secure smart contract libraries
- **Coinbase**: For OnchainKit and wallet integration

