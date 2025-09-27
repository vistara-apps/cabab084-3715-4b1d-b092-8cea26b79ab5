import { ethers } from 'ethers';
import { IPFSManager, NFTMetadata } from './ipfs';

// TicketNFT Contract ABI (simplified)
const TICKET_NFT_ABI = [
  'function mintTicket(address to, uint256 gameId, string memory gameType, uint256 entryFee, string memory tokenURI) external returns (uint256)',
  'function updateTicketResult(uint256 tokenId, bool isWinner, uint256 prizeAmount) external',
  'function getTicketMetadata(uint256 tokenId) external view returns (tuple(uint256 gameId, uint256 entryTime, string gameType, uint256 entryFee, bool isWinner, uint256 prizeAmount))',
  'function getUserTickets(address user) external view returns (uint256[] memory)',
  'function getGameTickets(uint256 gameId) external view returns (uint256[] memory)',
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function authorizeGameContract(uint256 gameId, address contract) external',
];

export interface TicketData {
  tokenId: number;
  gameId: number;
  gameType: string;
  entryFee: string;
  entryTime: number;
  isWinner: boolean;
  prizeAmount: string;
  owner: string;
  metadataURI: string;
}

export class NFTManager {
  private provider: ethers.providers.Provider;
  private signer?: ethers.Signer;
  private contract?: ethers.Contract;
  private ipfsManager: IPFSManager;

  constructor(
    provider: ethers.providers.Provider,
    signer?: ethers.Signer,
    contractAddress?: string
  ) {
    this.provider = provider;
    this.signer = signer;
    this.ipfsManager = new IPFSManager();

    if (contractAddress && signer) {
      this.contract = new ethers.Contract(contractAddress, TICKET_NFT_ABI, signer);
    }
  }

  // Initialize contract with address
  setContractAddress(address: string) {
    if (!this.signer) throw new Error('Signer required for contract interactions');
    this.contract = new ethers.Contract(address, TICKET_NFT_ABI, this.signer);
  }

  // Mint a new ticket NFT
  async mintTicket(
    gameId: number,
    gameType: string,
    entryFee: string,
    recipientAddress: string
  ): Promise<{ tokenId: number; txHash: string }> {
    if (!this.contract || !this.signer) {
      throw new Error('Contract and signer required for minting');
    }

    try {
      // Generate metadata
      const metadata = this.ipfsManager.generateTicketMetadata(
        0, // tokenId will be assigned by contract
        gameId,
        gameType,
        entryFee
      );

      // Upload metadata to IPFS
      const metadataURI = await this.ipfsManager.uploadMetadata(metadata);

      // Mint the NFT
      const tx = await this.contract.mintTicket(
        recipientAddress,
        gameId,
        gameType,
        ethers.utils.parseEther(entryFee),
        metadataURI
      );

      const receipt = await tx.wait();

      // Extract token ID from events (this is a simplified approach)
      const tokenId = await this.extractTokenIdFromReceipt(receipt);

      return {
        tokenId,
        txHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error('NFT minting failed:', error);
      throw error;
    }
  }

  // Update ticket result (mark as winner)
  async updateTicketResult(
    tokenId: number,
    isWinner: boolean,
    prizeAmount: string
  ): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for updating ticket');
    }

    try {
      const tx = await this.contract.updateTicketResult(
        tokenId,
        isWinner,
        ethers.utils.parseEther(prizeAmount)
      );

      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Ticket update failed:', error);
      throw error;
    }
  }

  // Get ticket data
  async getTicketData(tokenId: number): Promise<TicketData> {
    if (!this.contract) {
      throw new Error('Contract required for fetching ticket data');
    }

    try {
      const [metadata, owner, metadataURI] = await Promise.all([
        this.contract.getTicketMetadata(tokenId),
        this.contract.ownerOf(tokenId),
        this.contract.tokenURI(tokenId),
      ]);

      return {
        tokenId,
        gameId: metadata.gameId.toNumber(),
        gameType: metadata.gameType,
        entryFee: ethers.utils.formatEther(metadata.entryFee),
        entryTime: metadata.entryTime.toNumber(),
        isWinner: metadata.isWinner,
        prizeAmount: ethers.utils.formatEther(metadata.prizeAmount),
        owner,
        metadataURI,
      };
    } catch (error) {
      console.error('Failed to fetch ticket data:', error);
      throw error;
    }
  }

  // Get user's tickets
  async getUserTickets(userAddress: string): Promise<TicketData[]> {
    if (!this.contract) {
      throw new Error('Contract required for fetching user tickets');
    }

    try {
      const tokenIds = await this.contract.getUserTickets(userAddress);
      const tickets: TicketData[] = [];

      for (const tokenId of tokenIds) {
        try {
          const ticketData = await this.getTicketData(tokenId.toNumber());
          tickets.push(ticketData);
        } catch (error) {
          console.warn(`Failed to fetch ticket ${tokenId}:`, error);
        }
      }

      return tickets;
    } catch (error) {
      console.error('Failed to fetch user tickets:', error);
      throw error;
    }
  }

  // Get game tickets
  async getGameTickets(gameId: number): Promise<TicketData[]> {
    if (!this.contract) {
      throw new Error('Contract required for fetching game tickets');
    }

    try {
      const tokenIds = await this.contract.getGameTickets(gameId);
      const tickets: TicketData[] = [];

      for (const tokenId of tokenIds) {
        try {
          const ticketData = await this.getTicketData(tokenId.toNumber());
          tickets.push(ticketData);
        } catch (error) {
          console.warn(`Failed to fetch ticket ${tokenId}:`, error);
        }
      }

      return tickets;
    } catch (error) {
      console.error('Failed to fetch game tickets:', error);
      throw error;
    }
  }

  // Transfer ticket
  async transferTicket(
    fromAddress: string,
    toAddress: string,
    tokenId: number
  ): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for transferring tickets');
    }

    try {
      const tx = await this.contract.transferFrom(fromAddress, toAddress, tokenId);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Ticket transfer failed:', error);
      throw error;
    }
  }

  // Check if user owns ticket
  async ownsTicket(userAddress: string, tokenId: number): Promise<boolean> {
    if (!this.contract) return false;

    try {
      const owner = await this.contract.ownerOf(tokenId);
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  // Get ticket balance for user
  async getTicketBalance(userAddress: string): Promise<number> {
    if (!this.contract) return 0;

    try {
      const balance = await this.contract.balanceOf(userAddress);
      return balance.toNumber();
    } catch (error) {
      return 0;
    }
  }

  // Extract token ID from transaction receipt (simplified)
  private async extractTokenIdFromReceipt(receipt: ethers.providers.TransactionReceipt): Promise<number> {
    // In a real implementation, you'd parse the Transfer event
    // For now, we'll use a placeholder approach
    // This should be replaced with proper event parsing
    return Date.now(); // Placeholder - replace with actual token ID extraction
  }

  // Estimate gas for minting
  async estimateMintGas(
    gameId: number,
    gameType: string,
    entryFee: string,
    recipientAddress: string
  ): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract required for gas estimation');
    }

    const metadataURI = 'ipfs://placeholder'; // Placeholder for estimation

    const gasEstimate = await this.contract.estimateGas.mintTicket(
      recipientAddress,
      gameId,
      gameType,
      ethers.utils.parseEther(entryFee),
      metadataURI
    );

    return gasEstimate.toBigInt();
  }
}

// Utility functions
export function formatNFTError(error: any): string {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for NFT minting gas fees';
  }
  if (error.code === 'CALL_EXCEPTION') {
    return 'NFT contract call failed. Check contract address and network.';
  }
  if (error.message?.includes('ERC721')) {
    return 'NFT operation failed: Invalid token or ownership issue';
  }
  return error.message || 'NFT operation failed';
}

export function isValidTicketData(data: any): boolean {
  return !!(
    data &&
    typeof data.tokenId === 'number' &&
    typeof data.gameId === 'number' &&
    typeof data.gameType === 'string' &&
    typeof data.entryFee === 'string'
  );
}

export function calculateTicketRarity(ticketData: TicketData): 'common' | 'rare' | 'epic' | 'legendary' {
  const { gameType, isWinner, prizeAmount } = ticketData;

  if (isWinner && parseFloat(prizeAmount) > 1) return 'legendary';
  if (isWinner) return 'epic';
  if (gameType === 'tournament') return 'rare';
  return 'common';
}

