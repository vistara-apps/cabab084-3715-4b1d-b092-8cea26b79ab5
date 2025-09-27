import { ethers } from 'ethers';

// Chainlink VRF Configuration for Base Network
export const VRF_CONFIG = {
  // Base Mainnet
  base: {
    vrfCoordinator: '0x271682DEB8C4E0901D1a1550aD2e64D568E69909',
    keyHash: '0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90f2372e34a1f5834f9941a0b69', // 500 gwei
    subscriptionId: process.env.NEXT_PUBLIC_VRF_SUBSCRIPTION_ID || '0',
    callbackGasLimit: 100000,
  },
  // Base Goerli (Testnet)
  baseGoerli: {
    vrfCoordinator: '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
    keyHash: '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15bc', // 50 gwei
    subscriptionId: process.env.NEXT_PUBLIC_VRF_SUBSCRIPTION_ID || '0',
    callbackGasLimit: 100000,
  },
};

export interface VRFRequest {
  requestId: string;
  gameId: string;
  requester: string;
  timestamp: number;
  status: 'pending' | 'fulfilled' | 'failed';
}

export class VRFManager {
  private provider: ethers.providers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.providers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  // Get VRF configuration for current network
  getVRFConfig(chainId: number) {
    const networkName = chainId === 8453 ? 'base' : 'baseGoerli';
    return VRF_CONFIG[networkName];
  }

  // Request random words for game draw
  async requestRandomWords(
    gameContract: ethers.Contract,
    numWords: number = 1
  ): Promise<string> {
    if (!this.signer) throw new Error('Signer required for VRF requests');

    try {
      const config = this.getVRFConfig(await this.signer.getChainId());

      const tx = await gameContract.requestRandomWords(
        config.keyHash,
        config.subscriptionId,
        3, // requestConfirmations
        config.callbackGasLimit,
        numWords
      );

      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('VRF request failed:', error);
      throw error;
    }
  }

  // Listen for VRF fulfillment events
  async listenForFulfillment(
    gameContract: ethers.Contract,
    callback: (requestId: string, randomWords: bigint[]) => void
  ) {
    gameContract.on('RandomWordsFulfilled', (requestId, randomWords) => {
      callback(requestId.toString(), randomWords.map(w => w.toBigInt()));
    });
  }

  // Get VRF request status
  async getRequestStatus(requestId: string): Promise<VRFRequest | null> {
    // This would typically query a database or contract for request status
    // For now, return null as this requires backend implementation
    return null;
  }

  // Estimate gas for VRF request
  async estimateGas(gameContract: ethers.Contract): Promise<bigint> {
    if (!this.signer) throw new Error('Signer required for gas estimation');

    const config = this.getVRFConfig(await this.signer.getChainId());

    const gasEstimate = await gameContract.estimateGas.requestRandomWords(
      config.keyHash,
      config.subscriptionId,
      3,
      config.callbackGasLimit,
      1
    );

    return gasEstimate.toBigInt();
  }
}

// Utility functions
export function formatVRFError(error: any): string {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for VRF request gas fees';
  }
  if (error.code === 'CALL_EXCEPTION') {
    return 'VRF coordinator call failed. Check subscription and network.';
  }
  return error.message || 'VRF request failed';
}

export function isValidVRFConfig(config: any): boolean {
  return !!(
    config.vrfCoordinator &&
    config.keyHash &&
    config.subscriptionId &&
    config.callbackGasLimit
  );
}

