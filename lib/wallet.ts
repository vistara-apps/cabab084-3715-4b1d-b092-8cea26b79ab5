import { ethers } from 'ethers';
import { createWalletClient, custom, WalletClient } from 'viem';
import { base, baseGoerli } from 'viem/chains';

export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
  balance: string;
  ensName?: string;
}

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
}

export class WalletManager {
  private provider?: ethers.providers.Web3Provider;
  private signer?: ethers.Signer;
  private walletClient?: WalletClient;
  private currentChainId: number = 8453; // Base mainnet

  constructor() {
    this.initializeWallet();
  }

  // Initialize wallet connection
  async initializeWallet(): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();

      // Initialize Viem wallet client
      this.walletClient = createWalletClient({
        chain: base,
        transport: custom(window.ethereum),
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        this.currentChainId = parseInt(chainId, 16);
        window.location.reload(); // Reload on chain change
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          // Handle account change
          console.log('Account changed:', accounts[0]);
        }
      });

    } catch (error) {
      console.error('Wallet initialization failed:', error);
      throw error;
    }
  }

  // Connect wallet
  async connect(): Promise<WalletInfo> {
    if (!this.provider || !this.signer) {
      await this.initializeWallet();
    }

    if (!this.provider || !this.signer) {
      throw new Error('Failed to initialize wallet');
    }

    try {
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const balance = await this.signer.getBalance();

      // Try to get ENS name (only works on Ethereum mainnet)
      let ensName: string | undefined;
      try {
        const ensProvider = new ethers.providers.InfuraProvider('mainnet', process.env.NEXT_PUBLIC_INFURA_PROJECT_ID);
        ensName = await ensProvider.lookupAddress(address);
      } catch {
        // ENS not available or failed
      }

      const walletInfo: WalletInfo = {
        address,
        chainId: network.chainId,
        isConnected: true,
        balance: ethers.utils.formatEther(balance),
        ensName,
      };

      this.currentChainId = network.chainId;
      return walletInfo;

    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  // Disconnect wallet
  disconnect(): void {
    this.provider = undefined;
    this.signer = undefined;
    this.walletClient = undefined;
  }

  // Get current wallet info
  async getWalletInfo(): Promise<WalletInfo | null> {
    if (!this.provider || !this.signer) {
      return null;
    }

    try {
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const balance = await this.signer.getBalance();

      return {
        address,
        chainId: network.chainId,
        isConnected: true,
        balance: ethers.utils.formatEther(balance),
      };
    } catch (error) {
      return null;
    }
  }

  // Switch to Base network
  async switchToBase(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('Wallet not available');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet chain ID
      });
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await this.addBaseNetwork();
      } else {
        throw error;
      }
    }
  }

  // Add Base network to wallet
  async addBaseNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('Wallet not available');
    }

    const baseNetwork = {
      chainId: '0x2105',
      chainName: 'Base',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://mainnet.base.org'],
      blockExplorerUrls: ['https://basescan.org'],
    };

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [baseNetwork],
    });
  }

  // Send transaction
  async sendTransaction(txRequest: TransactionRequest): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.signer.sendTransaction({
        to: txRequest.to,
        value: txRequest.value ? ethers.utils.parseEther(txRequest.value) : undefined,
        data: txRequest.data,
        gasLimit: txRequest.gasLimit ? ethers.BigNumber.from(txRequest.gasLimit) : undefined,
      });

      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Sign message
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      return await this.signer.signMessage(message);
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  }

  // Estimate gas for transaction
  async estimateGas(txRequest: TransactionRequest): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not available');
    }

    try {
      const gasEstimate = await this.provider.estimateGas({
        to: txRequest.to,
        value: txRequest.value ? ethers.utils.parseEther(txRequest.value) : undefined,
        data: txRequest.data,
      });

      return gasEstimate.toString();
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw error;
    }
  }

  // Get gas price
  async getGasPrice(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not available');
    }

    try {
      const gasPrice = await this.provider.getGasPrice();
      return ethers.utils.formatUnits(gasPrice, 'gwei');
    } catch (error) {
      console.error('Failed to get gas price:', error);
      throw error;
    }
  }

  // Check if on correct network
  isOnBaseNetwork(): boolean {
    return this.currentChainId === 8453 || this.currentChainId === 84531; // Base mainnet or testnet
  }

  // Get current network name
  getNetworkName(): string {
    switch (this.currentChainId) {
      case 8453:
        return 'Base';
      case 84531:
        return 'Base Goerli';
      case 1:
        return 'Ethereum';
      default:
        return `Chain ${this.currentChainId}`;
    }
  }

  // Get ethers provider
  getProvider(): ethers.providers.Web3Provider | undefined {
    return this.provider;
  }

  // Get ethers signer
  getSigner(): ethers.Signer | undefined {
    return this.signer;
  }

  // Get Viem wallet client
  getWalletClient(): WalletClient | undefined {
    return this.walletClient;
  }
}

// Utility functions
export function formatWalletError(error: any): string {
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  }
  if (error.code === -32000) {
    return 'Insufficient funds for transaction';
  }
  if (error.code === 4902) {
    return 'Network not found. Please add the Base network to your wallet.';
  }
  if (error.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  return error.message || 'Wallet operation failed';
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function isValidAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}

export function formatBalance(balance: string, decimals: number = 4): string {
  const num = parseFloat(balance);
  if (num < 0.0001) return '< 0.0001';
  return num.toFixed(decimals);
}

// Global wallet instance
let walletManager: WalletManager | null = null;

export function getWalletManager(): WalletManager {
  if (!walletManager) {
    walletManager = new WalletManager();
  }
  return walletManager;
}

// React hook for wallet management (would be in a separate hooks file)
export function useWallet() {
  return {
    connect: async () => {
      const manager = getWalletManager();
      return await manager.connect();
    },
    disconnect: () => {
      const manager = getWalletManager();
      manager.disconnect();
    },
    getWalletInfo: async () => {
      const manager = getWalletManager();
      return await manager.getWalletInfo();
    },
    switchToBase: async () => {
      const manager = getWalletManager();
      return await manager.switchToBase();
    },
    sendTransaction: async (tx: TransactionRequest) => {
      const manager = getWalletManager();
      return await manager.sendTransaction(tx);
    },
    signMessage: async (message: string) => {
      const manager = getWalletManager();
      return await manager.signMessage(message);
    },
  };
}

