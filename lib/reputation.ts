import { ethers } from 'ethers';

// ReputationSystem Contract ABI (simplified)
const REPUTATION_SYSTEM_ABI = [
  'function recordGameParticipation(address user) external',
  'function recordGameWin(address user) external',
  'function recordLoanRepayment(address user) external',
  'function recordLoanDefault(address user) external',
  'function recordLoanGiven(address user) external',
  'function getUserReputation(address user) external view returns (tuple(uint256 score, uint256 gamesPlayed, uint256 gamesWon, uint256 loansGiven, uint256 loansRepaid, uint256 loansDefaulted, uint256 lastActivity, bool isActive))',
  'function getReputationScore(address user) external view returns (uint256)',
  'function getReputationLevel(uint256 score) external pure returns (string)',
  'function isUserActive(address user) external view returns (bool)',
  'function getTopReputedUsers(uint256 limit) external view returns (address[] memory, uint256[] memory)',
  'function authorizeContract(address contractAddress) external',
];

export interface UserReputation {
  score: number;
  gamesPlayed: number;
  gamesWon: number;
  loansGiven: number;
  loansRepaid: number;
  loansDefaulted: number;
  lastActivity: number;
  isActive: boolean;
  level?: string;
  color?: string;
  nextLevelScore?: number;
  progress?: number;
}

export interface ReputationLevel {
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
  benefits: string[];
}

export class ReputationManager {
  private provider: ethers.providers.Provider;
  private signer?: ethers.Signer;
  private contract?: ethers.Contract;

  // Reputation levels configuration
  private static readonly REPUTATION_LEVELS: ReputationLevel[] = [
    {
      name: 'Bronze',
      minScore: 0,
      maxScore: 99,
      color: '#CD7F32',
      benefits: ['Basic access to platform features'],
    },
    {
      name: 'Silver',
      minScore: 100,
      maxScore: 499,
      color: '#C0C0C0',
      benefits: ['Priority customer support', 'Lower platform fees'],
    },
    {
      name: 'Gold',
      minScore: 500,
      maxScore: 999,
      color: '#FFD700',
      benefits: ['Exclusive game access', 'Higher lending limits', 'VIP support'],
    },
    {
      name: 'Platinum',
      minScore: 1000,
      maxScore: 2499,
      color: '#E5E4E2',
      benefits: ['Beta feature access', 'Zero platform fees', 'Dedicated account manager'],
    },
    {
      name: 'Diamond',
      minScore: 2500,
      maxScore: Infinity,
      color: '#B9F2FF',
      benefits: ['Governance voting rights', 'Exclusive NFT drops', 'Revenue sharing'],
    },
  ];

  constructor(
    provider: ethers.providers.Provider,
    signer?: ethers.Signer,
    contractAddress?: string
  ) {
    this.provider = provider;
    this.signer = signer;

    if (contractAddress && signer) {
      this.contract = new ethers.Contract(contractAddress, REPUTATION_SYSTEM_ABI, signer);
    }
  }

  // Initialize contract with address
  setContractAddress(address: string) {
    if (!this.signer) throw new Error('Signer required for contract interactions');
    this.contract = new ethers.Contract(address, REPUTATION_SYSTEM_ABI, this.signer);
  }

  // Record game participation
  async recordGameParticipation(userAddress: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for reputation updates');
    }

    try {
      const tx = await this.contract.recordGameParticipation(userAddress);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to record game participation:', error);
      throw error;
    }
  }

  // Record game win
  async recordGameWin(userAddress: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for reputation updates');
    }

    try {
      const tx = await this.contract.recordGameWin(userAddress);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to record game win:', error);
      throw error;
    }
  }

  // Record loan repayment
  async recordLoanRepayment(userAddress: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for reputation updates');
    }

    try {
      const tx = await this.contract.recordLoanRepayment(userAddress);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to record loan repayment:', error);
      throw error;
    }
  }

  // Record loan default
  async recordLoanDefault(userAddress: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for reputation updates');
    }

    try {
      const tx = await this.contract.recordLoanDefault(userAddress);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to record loan default:', error);
      throw error;
    }
  }

  // Record loan given
  async recordLoanGiven(userAddress: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for reputation updates');
    }

    try {
      const tx = await this.contract.recordLoanGiven(userAddress);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to record loan given:', error);
      throw error;
    }
  }

  // Get user reputation
  async getUserReputation(userAddress: string): Promise<UserReputation> {
    if (!this.contract) {
      throw new Error('Contract required for fetching reputation');
    }

    try {
      const repData = await this.contract.getUserReputation(userAddress);

      const reputation: UserReputation = {
        score: repData.score.toNumber(),
        gamesPlayed: repData.gamesPlayed.toNumber(),
        gamesWon: repData.gamesWon.toNumber(),
        loansGiven: repData.loansGiven.toNumber(),
        loansRepaid: repData.loansRepaid.toNumber(),
        loansDefaulted: repData.loansDefaulted.toNumber(),
        lastActivity: repData.lastActivity.toNumber(),
        isActive: repData.isActive,
      };

      // Add computed fields
      reputation.level = this.getReputationLevel(reputation.score);
      reputation.color = this.getReputationColor(reputation.score);
      reputation.nextLevelScore = this.getNextLevelScore(reputation.score);
      reputation.progress = this.calculateLevelProgress(reputation.score);

      return reputation;
    } catch (error) {
      console.error('Failed to fetch user reputation:', error);
      throw error;
    }
  }

  // Get reputation score only
  async getReputationScore(userAddress: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract required for fetching reputation score');
    }

    try {
      const score = await this.contract.getReputationScore(userAddress);
      return score.toNumber();
    } catch (error) {
      console.error('Failed to fetch reputation score:', error);
      return 0;
    }
  }

  // Check if user is active
  async isUserActive(userAddress: string): Promise<boolean> {
    if (!this.contract) return false;

    try {
      return await this.contract.isUserActive(userAddress);
    } catch (error) {
      return false;
    }
  }

  // Get reputation level for score
  getReputationLevel(score: number): string {
    for (const level of ReputationManager.REPUTATION_LEVELS) {
      if (score >= level.minScore && score <= level.maxScore) {
        return level.name;
      }
    }
    return 'Bronze';
  }

  // Get reputation color for score
  getReputationColor(score: number): string {
    const level = ReputationManager.REPUTATION_LEVELS.find(
      l => score >= l.minScore && score <= l.maxScore
    );
    return level?.color || '#CD7F32';
  }

  // Get next level score
  getNextLevelScore(currentScore: number): number | undefined {
    for (let i = 0; i < ReputationManager.REPUTATION_LEVELS.length; i++) {
      const level = ReputationManager.REPUTATION_LEVELS[i];
      if (currentScore >= level.minScore && currentScore <= level.maxScore) {
        if (i < ReputationManager.REPUTATION_LEVELS.length - 1) {
          return ReputationManager.REPUTATION_LEVELS[i + 1].minScore;
        }
        return undefined; // Max level reached
      }
    }
    return ReputationManager.REPUTATION_LEVELS[0].minScore;
  }

  // Calculate progress to next level
  calculateLevelProgress(currentScore: number): number {
    const nextLevelScore = this.getNextLevelScore(currentScore);
    if (!nextLevelScore) return 100; // Max level

    const currentLevel = ReputationManager.REPUTATION_LEVELS.find(
      l => currentScore >= l.minScore && currentScore <= l.maxScore
    );

    if (!currentLevel) return 0;

    const levelRange = nextLevelScore - currentLevel.minScore;
    const progressInLevel = currentScore - currentLevel.minScore;

    return Math.min((progressInLevel / levelRange) * 100, 100);
  }

  // Get all reputation levels
  getReputationLevels(): ReputationLevel[] {
    return ReputationManager.REPUTATION_LEVELS;
  }

  // Calculate reputation score from activities
  calculateReputationScore(activities: {
    gamesPlayed: number;
    gamesWon: number;
    loansRepaid: number;
    loansDefaulted: number;
    loansGiven: number;
  }): number {
    const {
      gamesPlayed,
      gamesWon,
      loansRepaid,
      loansDefaulted,
      loansGiven,
    } = activities;

    // Constants matching contract
    const GAME_PARTICIPATION_POINTS = 10;
    const GAME_WIN_POINTS = 50;
    const LOAN_REPAYMENT_POINTS = 25;
    const LOAN_DEFAULT_PENALTY = 100;
    const LOAN_GIVEN_POINTS = 5;

    let score = 0;

    score += gamesPlayed * GAME_PARTICIPATION_POINTS;
    score += gamesWon * GAME_WIN_POINTS;
    score += loansRepaid * LOAN_REPAYMENT_POINTS;
    score += loansGiven * LOAN_GIVEN_POINTS;
    score -= loansDefaulted * LOAN_DEFAULT_PENALTY;

    return Math.max(0, score); // Ensure non-negative score
  }

  // Authorize a contract to update reputation
  async authorizeContract(contractAddress: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for authorization');
    }

    try {
      const tx = await this.contract.authorizeContract(contractAddress);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to authorize contract:', error);
      throw error;
    }
  }
}

// Utility functions
export function formatReputationError(error: any): string {
  if (error.code === 'CALL_EXCEPTION') {
    return 'Reputation contract call failed. Check contract address and network.';
  }
  return error.message || 'Reputation operation failed';
}

export function getReputationLevelIcon(level: string): string {
  switch (level.toLowerCase()) {
    case 'bronze': return '🥉';
    case 'silver': return '🥈';
    case 'gold': return '🥇';
    case 'platinum': return '💎';
    case 'diamond': return '💎';
    default: return '🏅';
  }
}

export function getReputationProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 60) return 'bg-yellow-500';
  if (progress >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function formatReputationScore(score: number): string {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toString();
}

export function getReputationBenefits(level: string): string[] {
  const levelData = ReputationManager.prototype.getReputationLevels().find(
    l => l.name.toLowerCase() === level.toLowerCase()
  );
  return levelData?.benefits || [];
}

