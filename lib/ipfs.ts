import { create } from 'ipfs-http-client';

// IPFS Configuration
const IPFS_CONFIG = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}:${process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET}`
    ).toString('base64')}`,
  },
};

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  properties?: {
    gameId: number;
    gameType: string;
    entryFee: string;
    timestamp: number;
  };
}

export class IPFSManager {
  private client: any;

  constructor() {
    try {
      this.client = create(IPFS_CONFIG);
    } catch (error) {
      console.warn('IPFS client not initialized:', error);
    }
  }

  // Upload metadata to IPFS
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    if (!this.client) {
      throw new Error('IPFS client not initialized');
    }

    try {
      const metadataString = JSON.stringify(metadata);
      const added = await this.client.add(metadataString);
      return `ipfs://${added.path}`;
    } catch (error) {
      console.error('Failed to upload metadata to IPFS:', error);
      throw error;
    }
  }

  // Upload image to IPFS
  async uploadImage(imageFile: File | Blob): Promise<string> {
    if (!this.client) {
      throw new Error('IPFS client not initialized');
    }

    try {
      const added = await this.client.add(imageFile);
      return `ipfs://${added.path}`;
    } catch (error) {
      console.error('Failed to upload image to IPFS:', error);
      throw error;
    }
  }

  // Generate ticket metadata
  generateTicketMetadata(
    tokenId: number,
    gameId: number,
    gameType: string,
    entryFee: string,
    isWinner: boolean = false,
    prizeAmount: string = '0'
  ): NFTMetadata {
    const name = `FairPlay Nexus Ticket #${tokenId}`;
    const description = isWinner
      ? `Winner ticket for ${gameType} game #${gameId}. Prize: ${prizeAmount} ETH`
      : `Entry ticket for ${gameType} game #${gameId}. Entry fee: ${entryFee} ETH`;

    return {
      name,
      description,
      image: this.generateTicketImage(gameType, isWinner),
      external_url: `${process.env.NEXT_PUBLIC_APP_URL}/ticket/${tokenId}`,
      attributes: [
        {
          trait_type: 'Game Type',
          value: gameType,
        },
        {
          trait_type: 'Game ID',
          value: gameId,
        },
        {
          trait_type: 'Entry Fee',
          value: parseFloat(entryFee),
          display_type: 'number',
        },
        {
          trait_type: 'Status',
          value: isWinner ? 'Winner' : 'Participant',
        },
        ...(isWinner ? [{
          trait_type: 'Prize Amount',
          value: parseFloat(prizeAmount),
          display_type: 'number',
        }] : []),
      ],
      properties: {
        gameId,
        gameType,
        entryFee,
        timestamp: Date.now(),
      },
    };
  }

  // Generate SVG ticket image (fallback when IPFS image upload fails)
  private generateTicketImage(gameType: string, isWinner: boolean): string {
    const colors = {
      lottery: isWinner ? '#FFD700' : '#1e40af',
      raffle: isWinner ? '#FFD700' : '#7c3aed',
      tournament: isWinner ? '#FFD700' : '#dc2626',
    };

    const color = colors[gameType as keyof typeof colors] || '#6b7280';

    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}80;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#grad1)" rx="20"/>
        <circle cx="200" cy="150" r="60" fill="white" opacity="0.9"/>
        <text x="200" y="165" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${color}">
          ${isWinner ? '🏆' : '🎫'}
        </text>
        <text x="200" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">
          ${gameType.toUpperCase()}
        </text>
        <text x="200" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white" opacity="0.8">
          FAIRPLAY NEXUS
        </text>
        ${isWinner ? `
          <text x="200" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFD700">
            WINNER
          </text>
        ` : ''}
      </svg>
    `;

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  // Pin content to ensure persistence
  async pinContent(cid: string): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.pin.add(cid);
    } catch (error) {
      console.warn('Failed to pin content:', error);
    }
  }

  // Get IPFS gateway URL
  static getGatewayURL(ipfsUrl: string): string {
    if (ipfsUrl.startsWith('ipfs://')) {
      return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return ipfsUrl;
  }

  // Validate IPFS URL
  static isValidIPFSUrl(url: string): boolean {
    return url.startsWith('ipfs://') || url.includes('ipfs.io');
  }
}

// Utility functions
export function formatIPFSError(error: any): string {
  if (error.message?.includes('authorization')) {
    return 'IPFS upload failed: Invalid API credentials';
  }
  if (error.message?.includes('network')) {
    return 'IPFS upload failed: Network error';
  }
  return error.message || 'IPFS upload failed';
}

export function generateTicketName(tokenId: number, gameType: string): string {
  return `FairPlay Nexus ${gameType} Ticket #${tokenId}`;
}

export function generateTicketDescription(
  gameId: number,
  gameType: string,
  entryFee: string,
  isWinner: boolean,
  prizeAmount?: string
): string {
  const baseDesc = `Entry ticket for ${gameType} game #${gameId} with entry fee of ${entryFee} ETH.`;

  if (isWinner && prizeAmount) {
    return `${baseDesc} Winner! Prize amount: ${prizeAmount} ETH.`;
  }

  return baseDesc;
}

