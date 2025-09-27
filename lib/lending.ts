import { ethers } from 'ethers';

// LendingMarketplace Contract ABI (simplified)
const LENDING_MARKETPLACE_ABI = [
  'function requestLoan(address collateralAsset, address loanAsset, uint256 collateralAmount, uint256 loanAmount, uint256 interestRate, uint256 duration, uint256 liquidationThreshold) external',
  'function offerLoan(address loanAsset, uint256 loanAmount, uint256 interestRate, uint256 duration, uint256 minCollateralRatio) external',
  'function fundLoan(uint256 loanId, uint256 offerId) external',
  'function repayLoan(uint256 loanId, uint256 repaymentAmount) external',
  'function liquidateLoan(uint256 loanId) external',
  'function calculateInterestDue(uint256 loanId) external view returns (uint256)',
  'function isLiquidatable(uint256 loanId) external view returns (bool)',
  'function getLoan(uint256 loanId) external view returns (tuple(uint256 loanId, address borrower, address lender, address collateralAsset, address loanAsset, uint256 collateralAmount, uint256 loanAmount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 liquidationThreshold, uint8 status, uint256 lastInterestPayment, uint256 totalInterestPaid))',
  'function getLoanOffer(uint256 offerId) external view returns (tuple(uint256 offerId, address lender, address loanAsset, uint256 loanAmount, uint256 interestRate, uint256 duration, uint256 minCollateralRatio, bool isActive, uint256 createdAt))',
  'function getUserLoans(address user) external view returns (uint256[] memory)',
  'function getUserOffers(address user) external view returns (uint256[] memory)',
  'function getActiveLoanOffers() external view returns (uint256[] memory)',
];

export interface Loan {
  loanId: number;
  borrower: string;
  lender: string;
  collateralAsset: string;
  loanAsset: string;
  collateralAmount: string;
  loanAmount: string;
  interestRate: number; // Basis points (e.g., 500 = 5%)
  duration: number; // Days
  startTime: number;
  liquidationThreshold: number; // Basis points
  status: 'pending' | 'active' | 'repaid' | 'liquidated' | 'defaulted';
  lastInterestPayment: number;
  totalInterestPaid: string;
  currentLTV?: number;
  isLiquidatable?: boolean;
  interestDue?: string;
}

export interface LoanOffer {
  offerId: number;
  lender: string;
  loanAsset: string;
  loanAmount: string;
  interestRate: number;
  duration: number;
  minCollateralRatio: number;
  isActive: boolean;
  createdAt: number;
}

export interface LoanRequest {
  collateralAsset: string;
  loanAsset: string;
  collateralAmount: string;
  loanAmount: string;
  interestRate: number;
  duration: number;
  liquidationThreshold: number;
}

export class LendingManager {
  private provider: ethers.providers.Provider;
  private signer?: ethers.Signer;
  private contract?: ethers.Contract;

  constructor(
    provider: ethers.providers.Provider,
    signer?: ethers.Signer,
    contractAddress?: string
  ) {
    this.provider = provider;
    this.signer = signer;

    if (contractAddress && signer) {
      this.contract = new ethers.Contract(contractAddress, LENDING_MARKETPLACE_ABI, signer);
    }
  }

  // Initialize contract with address
  setContractAddress(address: string) {
    if (!this.signer) throw new Error('Signer required for contract interactions');
    this.contract = new ethers.Contract(address, LENDING_MARKETPLACE_ABI, this.signer);
  }

  // Request a loan
  async requestLoan(request: LoanRequest): Promise<{ loanId: number; txHash: string }> {
    if (!this.contract) {
      throw new Error('Contract required for loan requests');
    }

    try {
      const tx = await this.contract.requestLoan(
        request.collateralAsset,
        request.loanAsset,
        ethers.utils.parseEther(request.collateralAmount),
        ethers.utils.parseEther(request.loanAmount),
        request.interestRate,
        request.duration,
        request.liquidationThreshold
      );

      const receipt = await tx.wait();

      // Extract loan ID from transaction (simplified)
      const loanId = await this.extractLoanIdFromReceipt(receipt);

      return {
        loanId,
        txHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error('Loan request failed:', error);
      throw error;
    }
  }

  // Offer a loan
  async offerLoan(
    loanAsset: string,
    loanAmount: string,
    interestRate: number,
    duration: number,
    minCollateralRatio: number
  ): Promise<{ offerId: number; txHash: string }> {
    if (!this.contract) {
      throw new Error('Contract required for loan offers');
    }

    try {
      const tx = await this.contract.offerLoan(
        loanAsset,
        ethers.utils.parseEther(loanAmount),
        interestRate,
        duration,
        minCollateralRatio
      );

      const receipt = await tx.wait();
      const offerId = await this.extractOfferIdFromReceipt(receipt);

      return {
        offerId,
        txHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error('Loan offer failed:', error);
      throw error;
    }
  }

  // Fund a loan
  async fundLoan(loanId: number, offerId: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for funding loans');
    }

    try {
      const tx = await this.contract.fundLoan(loanId, offerId);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Loan funding failed:', error);
      throw error;
    }
  }

  // Repay a loan
  async repayLoan(loanId: number, repaymentAmount: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for loan repayment');
    }

    try {
      const tx = await this.contract.repayLoan(
        loanId,
        ethers.utils.parseEther(repaymentAmount)
      );
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Loan repayment failed:', error);
      throw error;
    }
  }

  // Liquidate a loan
  async liquidateLoan(loanId: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract required for loan liquidation');
    }

    try {
      const tx = await this.contract.liquidateLoan(loanId);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Loan liquidation failed:', error);
      throw error;
    }
  }

  // Get loan details
  async getLoan(loanId: number): Promise<Loan> {
    if (!this.contract) {
      throw new Error('Contract required for fetching loan data');
    }

    try {
      const loanData = await this.contract.getLoan(loanId);

      const loan: Loan = {
        loanId: loanData.loanId.toNumber(),
        borrower: loanData.borrower,
        lender: loanData.lender,
        collateralAsset: loanData.collateralAsset,
        loanAsset: loanData.loanAsset,
        collateralAmount: ethers.utils.formatEther(loanData.collateralAmount),
        loanAmount: ethers.utils.formatEther(loanData.loanAmount),
        interestRate: loanData.interestRate.toNumber(),
        duration: loanData.duration.toNumber(),
        startTime: loanData.startTime.toNumber(),
        liquidationThreshold: loanData.liquidationThreshold.toNumber(),
        status: this.mapLoanStatus(loanData.status),
        lastInterestPayment: loanData.lastInterestPayment.toNumber(),
        totalInterestPaid: ethers.utils.formatEther(loanData.totalInterestPaid),
      };

      // Add computed fields
      loan.currentLTV = this.calculateLTV(
        parseFloat(loan.loanAmount),
        parseFloat(loan.collateralAmount)
      );

      loan.isLiquidatable = await this.contract.isLiquidatable(loanId);
      loan.interestDue = ethers.utils.formatEther(
        await this.contract.calculateInterestDue(loanId)
      );

      return loan;
    } catch (error) {
      console.error('Failed to fetch loan data:', error);
      throw error;
    }
  }

  // Get loan offer details
  async getLoanOffer(offerId: number): Promise<LoanOffer> {
    if (!this.contract) {
      throw new Error('Contract required for fetching offer data');
    }

    try {
      const offerData = await this.contract.getLoanOffer(offerId);

      return {
        offerId: offerData.offerId.toNumber(),
        lender: offerData.lender,
        loanAsset: offerData.loanAsset,
        loanAmount: ethers.utils.formatEther(offerData.loanAmount),
        interestRate: offerData.interestRate.toNumber(),
        duration: offerData.duration.toNumber(),
        minCollateralRatio: offerData.minCollateralRatio.toNumber(),
        isActive: offerData.isActive,
        createdAt: offerData.createdAt.toNumber(),
      };
    } catch (error) {
      console.error('Failed to fetch loan offer:', error);
      throw error;
    }
  }

  // Get user's loans
  async getUserLoans(userAddress: string): Promise<Loan[]> {
    if (!this.contract) {
      throw new Error('Contract required for fetching user loans');
    }

    try {
      const loanIds = await this.contract.getUserLoans(userAddress);
      const loans: Loan[] = [];

      for (const loanId of loanIds) {
        try {
          const loan = await this.getLoan(loanId.toNumber());
          loans.push(loan);
        } catch (error) {
          console.warn(`Failed to fetch loan ${loanId}:`, error);
        }
      }

      return loans;
    } catch (error) {
      console.error('Failed to fetch user loans:', error);
      throw error;
    }
  }

  // Get user's offers
  async getUserOffers(userAddress: string): Promise<LoanOffer[]> {
    if (!this.contract) {
      throw new Error('Contract required for fetching user offers');
    }

    try {
      const offerIds = await this.contract.getUserOffers(userAddress);
      const offers: LoanOffer[] = [];

      for (const offerId of offerIds) {
        try {
          const offer = await this.getLoanOffer(offerId.toNumber());
          offers.push(offer);
        } catch (error) {
          console.warn(`Failed to fetch offer ${offerId}:`, error);
        }
      }

      return offers;
    } catch (error) {
      console.error('Failed to fetch user offers:', error);
      throw error;
    }
  }

  // Get active loan offers
  async getActiveLoanOffers(): Promise<LoanOffer[]> {
    if (!this.contract) {
      throw new Error('Contract required for fetching active offers');
    }

    try {
      const offerIds = await this.contract.getActiveLoanOffers();
      const offers: LoanOffer[] = [];

      for (const offerId of offerIds) {
        try {
          const offer = await this.getLoanOffer(offerId.toNumber());
          offers.push(offer);
        } catch (error) {
          console.warn(`Failed to fetch offer ${offerId}:`, error);
        }
      }

      return offers;
    } catch (error) {
      console.error('Failed to fetch active offers:', error);
      throw error;
    }
  }

  // Calculate LTV ratio
  calculateLTV(loanAmount: number, collateralValue: number): number {
    if (collateralValue === 0) return 0;
    return (loanAmount / collateralValue) * 100;
  }

  // Calculate APY from interest rate
  calculateAPY(interestRate: number, compoundingPeriods: number = 365): number {
    return ((1 + interestRate / 10000 / compoundingPeriods) ** compoundingPeriods - 1) * 100;
  }

  // Check if loan is at risk of liquidation
  isLoanAtRisk(ltv: number, liquidationThreshold: number): boolean {
    return ltv >= liquidationThreshold * 0.8; // 80% of liquidation threshold
  }

  // Map contract status to readable format
  private mapLoanStatus(status: number): Loan['status'] {
    switch (status) {
      case 0: return 'pending';
      case 1: return 'active';
      case 2: return 'repaid';
      case 3: return 'liquidated';
      case 4: return 'defaulted';
      default: return 'pending';
    }
  }

  // Extract loan ID from receipt (simplified)
  private async extractLoanIdFromReceipt(receipt: ethers.providers.TransactionReceipt): Promise<number> {
    // In a real implementation, you'd parse the LoanRequested event
    return Date.now(); // Placeholder
  }

  // Extract offer ID from receipt (simplified)
  private async extractOfferIdFromReceipt(receipt: ethers.providers.TransactionReceipt): Promise<number> {
    // In a real implementation, you'd parse the LoanOffered event
    return Date.now(); // Placeholder
  }

  // Estimate gas for loan request
  async estimateLoanRequestGas(request: LoanRequest): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract required for gas estimation');
    }

    const gasEstimate = await this.contract.estimateGas.requestLoan(
      request.collateralAsset,
      request.loanAsset,
      ethers.utils.parseEther(request.collateralAmount),
      ethers.utils.parseEther(request.loanAmount),
      request.interestRate,
      request.duration,
      request.liquidationThreshold
    );

    return gasEstimate.toBigInt();
  }
}

// Utility functions
export function formatLendingError(error: any): string {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for lending operation';
  }
  if (error.code === 'CALL_EXCEPTION') {
    return 'Lending contract call failed. Check contract address and network.';
  }
  if (error.message?.includes('collateral')) {
    return 'Insufficient collateral for the requested loan';
  }
  return error.message || 'Lending operation failed';
}

export function formatInterestRate(rate: number): string {
  return `${(rate / 100).toFixed(2)}%`;
}

export function formatDuration(days: number): string {
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

export function getLoanStatusColor(status: Loan['status']): string {
  switch (status) {
    case 'active': return 'text-green-400';
    case 'pending': return 'text-yellow-400';
    case 'repaid': return 'text-blue-400';
    case 'liquidated': return 'text-red-400';
    case 'defaulted': return 'text-red-600';
    default: return 'text-gray-400';
  }
}

export function getLoanStatusBadge(status: Loan['status']): string {
  switch (status) {
    case 'active': return 'bg-green-500/20 text-green-400';
    case 'pending': return 'bg-yellow-500/20 text-yellow-400';
    case 'repaid': return 'bg-blue-500/20 text-blue-400';
    case 'liquidated': return 'bg-red-500/20 text-red-400';
    case 'defaulted': return 'bg-red-600/20 text-red-600';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}

