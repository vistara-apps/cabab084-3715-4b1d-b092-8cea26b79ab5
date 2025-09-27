export interface User {
  userId: string;
  walletAddress: string;
  reputationScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  gameId: string;
  type: 'lottery' | 'raffle' | 'tournament';
  entryFee: string;
  startTime: Date;
  endTime: Date;
  winningConditions: string;
  winnerId?: string;
  drawTxHash?: string;
  createdAt: Date;
  totalPrize: string;
  participantCount: number;
  status: 'upcoming' | 'active' | 'drawing' | 'completed';
}

export interface TicketNFT {
  tokenId: string;
  contractAddress: string;
  gameId: string;
  ownerWalletAddress: string;
  mintedAt: Date;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}

export interface Loan {
  loanId: string;
  lenderWalletAddress: string;
  borrowerWalletAddress: string;
  principalAmount: string;
  interestRate: number;
  collateralAsset: string;
  collateralAmount: string;
  loanStatus: 'active' | 'pending' | 'repaid' | 'liquidated' | 'defaulted';
  createdAt: Date;
  closedAt?: Date;
  liquidationThreshold: number;
  duration: number; // in days
  currentValue: string;
}

export interface Collateral {
  collateralId: string;
  loanId: string;
  assetType: string;
  amount: string;
  currentValue: string;
  smartContractAddress: string;
  liquidationThreshold: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface GameStats {
  totalGames: number;
  activeGames: number;
  totalPrizePool: string;
  totalParticipants: number;
}

export interface LendingStats {
  totalLoaned: string;
  activeLoans: number;
  averageAPY: number;
  totalCollateral: string;
}

export interface UserStats {
  gamesWon: number;
  totalWinnings: string;
  loansGiven: number;
  loansTaken: number;
  reputationScore: number;
}
