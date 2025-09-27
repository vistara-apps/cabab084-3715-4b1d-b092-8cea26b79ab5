'use client';

import { Loan } from '@/lib/types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { HStack, VStack } from './ui';
import { formatToken, calculateLTV, formatAddress } from '@/lib/utils';
import { TrendingUp, Shield, Clock, AlertTriangle } from 'lucide-react';

interface LoanCardProps {
  loan: Loan;
  userAddress?: string;
  onAction?: (loanId: string, action: 'fund' | 'repay' | 'liquidate') => void;
}

export function LoanCard({ loan, userAddress, onAction }: LoanCardProps) {
  const isLender = userAddress === loan.lenderWalletAddress;
  const isBorrower = userAddress === loan.borrowerWalletAddress;
  const ltv = calculateLTV(parseFloat(loan.principalAmount), parseFloat(loan.currentValue));
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'pending': return 'status-pending';
      case 'repaid': return 'status-completed';
      case 'liquidated': return 'text-red-400 bg-red-500/20';
      case 'defaulted': return 'text-red-400 bg-red-500/20';
      default: return 'status-pending';
    }
  };

  const isNearLiquidation = ltv > loan.liquidationThreshold * 0.9;

  return (
    <Card className="loan-card">
      <VStack spacing="md">
        {/* Header */}
        <HStack justify="between">
          <HStack spacing="sm">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">
                {formatToken(loan.principalAmount, 'ETH')} Loan
              </h3>
              <p className="text-sm text-muted">
                {loan.interestRate}% APY • {loan.duration} days
              </p>
            </div>
          </HStack>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.loanStatus)}`}>
            {loan.loanStatus}
          </span>
        </HStack>

        {/* Participants */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-surface/50 rounded-lg">
          <div>
            <p className="text-xs text-muted mb-1">Lender</p>
            <p className="text-sm font-medium">
              {formatAddress(loan.lenderWalletAddress)}
              {isLender && <span className="text-accent ml-1">(You)</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Borrower</p>
            <p className="text-sm font-medium">
              {formatAddress(loan.borrowerWalletAddress)}
              {isBorrower && <span className="text-accent ml-1">(You)</span>}
            </p>
          </div>
        </div>

        {/* Collateral Info */}
        <VStack spacing="sm">
          <HStack justify="between">
            <HStack spacing="xs">
              <Shield className="w-4 h-4 text-muted" />
              <span className="text-sm text-muted">Collateral</span>
            </HStack>
            <span className="text-sm font-medium">
              {formatToken(loan.collateralAmount, loan.collateralAsset)}
            </span>
          </HStack>
          
          <HStack justify="between">
            <span className="text-sm text-muted">LTV Ratio</span>
            <span className={`text-sm font-medium ${isNearLiquidation ? 'text-red-400' : 'text-fg'}`}>
              {ltv.toFixed(1)}%
            </span>
          </HStack>

          <HStack justify="between">
            <span className="text-sm text-muted">Liquidation at</span>
            <span className="text-sm font-medium text-red-400">
              {loan.liquidationThreshold}%
            </span>
          </HStack>
        </VStack>

        {/* Warning for near liquidation */}
        {isNearLiquidation && loan.loanStatus === 'active' && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-sm text-red-400">
              Near liquidation threshold
            </p>
          </div>
        )}

        {/* Actions */}
        <HStack spacing="sm" className="w-full">
          {loan.loanStatus === 'pending' && !isLender && !isBorrower && (
            <Button 
              className="flex-1"
              onClick={() => onAction?.(loan.loanId, 'fund')}
            >
              Fund Loan
            </Button>
          )}
          
          {loan.loanStatus === 'active' && isBorrower && (
            <Button 
              className="flex-1"
              onClick={() => onAction?.(loan.loanId, 'repay')}
            >
              Repay Loan
            </Button>
          )}
          
          {loan.loanStatus === 'active' && isLender && ltv >= loan.liquidationThreshold && (
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={() => onAction?.(loan.loanId, 'liquidate')}
            >
              Liquidate
            </Button>
          )}
          
          {loan.loanStatus === 'pending' && isLender && (
            <Button variant="outline" className="flex-1" disabled>
              Waiting for Funding
            </Button>
          )}
        </HStack>
      </VStack>
    </Card>
  );
}
