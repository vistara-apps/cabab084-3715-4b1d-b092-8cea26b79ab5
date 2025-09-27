'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { VStack, HStack } from './ui';
import { Loan, LoanOffer, LendingManager } from '@/lib/lending';
import { useWallet } from '@/hooks/useWallet';
import {
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Plus
} from 'lucide-react';

interface LendingDashboardProps {
  contractAddress?: string;
}

export function LendingDashboard({ contractAddress }: LendingDashboardProps) {
  const { walletInfo, isConnected } = useWallet();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-loans' | 'my-offers' | 'marketplace'>('my-loans');

  const lendingManager = new LendingManager(
    null as any, // Placeholder - will be set when wallet is connected
    null as any, // Placeholder - will be set when wallet is connected
    contractAddress
  );

  useEffect(() => {
    if (isConnected && walletInfo?.address && contractAddress) {
      loadData();
    }
  }, [isConnected, walletInfo?.address, contractAddress, activeTab]);

  const loadData = async () => {
    if (!walletInfo?.address || !contractAddress) return;

    setLoading(true);
    try {
      if (activeTab === 'my-loans') {
        const userLoans = await lendingManager.getUserLoans(walletInfo.address);
        setLoans(userLoans);
      } else if (activeTab === 'my-offers') {
        const userOffers = await lendingManager.getUserOffers(walletInfo.address);
        setOffers(userOffers);
      } else if (activeTab === 'marketplace') {
        const activeOffers = await lendingManager.getActiveLoanOffers();
        setOffers(activeOffers);
      }
    } catch (error) {
      console.error('Failed to load lending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanAction = async (loanId: number, action: 'repay' | 'liquidate') => {
    if (!contractAddress) return;

    try {
      if (action === 'repay') {
        // In a real implementation, this would calculate the repayment amount
        const repaymentAmount = '1.0'; // Placeholder
        await lendingManager.repayLoan(loanId, repaymentAmount);
      } else if (action === 'liquidate') {
        await lendingManager.liquidateLoan(loanId);
      }
      // Reload data after action
      await loadData();
    } catch (error) {
      console.error(`Failed to ${action} loan:`, error);
    }
  };

  const handleFundOffer = async (offerId: number) => {
    if (!contractAddress) return;

    try {
      // In a real implementation, this would require finding a matching loan request
      // For now, this is a placeholder
      console.log('Funding offer:', offerId);
      await loadData();
    } catch (error) {
      console.error('Failed to fund offer:', error);
    }
  };

  const getLoanStatusIcon = (status: Loan['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'repaid': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'liquidated': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'defaulted': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDuration = (days: number) => {
    if (days < 30) return `${days} days`;
    return `${Math.floor(days / 30)} months`;
  };

  const tabs = [
    { id: 'my-loans', label: 'My Loans', icon: DollarSign },
    { id: 'my-offers', label: 'My Offers', icon: TrendingUp },
    { id: 'marketplace', label: 'Marketplace', icon: TrendingUp },
  ];

  if (!isConnected) {
    return (
      <Card className="p-8 text-center">
        <VStack spacing="md">
          <div className="text-4xl">💰</div>
          <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
          <p className="text-muted">Connect your wallet to access the lending marketplace</p>
        </VStack>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-surface/50 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-accent text-bg font-medium'
                : 'text-muted hover:text-fg hover:bg-surface/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <span className="ml-2">Loading lending data...</span>
          </div>
        </Card>
      ) : (
        <>
          {activeTab === 'my-loans' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Loans</h2>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Loan
                </Button>
              </div>

              {loans.length === 0 ? (
                <Card className="p-8 text-center">
                  <VStack spacing="md">
                    <div className="text-4xl">💰</div>
                    <h3 className="text-lg font-semibold">No Loans Yet</h3>
                    <p className="text-muted">You haven't taken any loans yet. Request your first loan to get started!</p>
                  </VStack>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {loans.map((loan) => (
                    <Card key={loan.loanId} className="p-6">
                      <VStack spacing="md">
                        <HStack justify="between">
                          <h3 className="font-semibold">Loan #{loan.loanId}</h3>
                          <HStack spacing="xs">
                            {getLoanStatusIcon(loan.status)}
                            <span className="text-sm capitalize">{loan.status}</span>
                          </HStack>
                        </HStack>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted">Amount</div>
                            <div className="font-semibold">{loan.loanAmount} ETH</div>
                          </div>
                          <div>
                            <div className="text-muted">Interest Rate</div>
                            <div className="font-semibold">{loan.interestRate / 100}% APY</div>
                          </div>
                          <div>
                            <div className="text-muted">Duration</div>
                            <div className="font-semibold">{formatDuration(loan.duration)}</div>
                          </div>
                          <div>
                            <div className="text-muted">LTV</div>
                            <div className={`font-semibold ${loan.currentLTV && loan.currentLTV > 80 ? 'text-red-400' : 'text-green-400'}`}>
                              {loan.currentLTV?.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {loan.status === 'active' && (
                          <div className="pt-2 border-t border-border">
                            <div className="text-sm text-muted mb-2">Interest Due: {loan.interestDue} ETH</div>
                            <HStack spacing="sm">
                              <Button
                                size="sm"
                                onClick={() => handleLoanAction(loan.loanId, 'repay')}
                                className="flex-1"
                              >
                                Repay
                              </Button>
                              {loan.isLiquidatable && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleLoanAction(loan.loanId, 'liquidate')}
                                >
                                  Liquidate
                                </Button>
                              )}
                            </HStack>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const baseScanUrl = `https://basescan.org/address/${contractAddress}`;
                            window.open(baseScanUrl, '_blank');
                          }}
                          className="w-full"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View on BaseScan
                        </Button>
                      </VStack>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === 'my-offers' || activeTab === 'marketplace') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {activeTab === 'my-offers' ? 'My Offers' : 'Loan Marketplace'}
                </h2>
                {activeTab === 'my-offers' && (
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Offer
                  </Button>
                )}
              </div>

              {offers.length === 0 ? (
                <Card className="p-8 text-center">
                  <VStack spacing="md">
                    <div className="text-4xl">📊</div>
                    <h3 className="text-lg font-semibold">
                      {activeTab === 'my-offers' ? 'No Offers Yet' : 'No Active Offers'}
                    </h3>
                    <p className="text-muted">
                      {activeTab === 'my-offers'
                        ? 'You haven\'t created any loan offers yet. Create your first offer to start lending!'
                        : 'There are no active loan offers in the marketplace right now.'
                      }
                    </p>
                  </VStack>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {offers.map((offer) => (
                    <Card key={offer.offerId} className="p-6">
                      <VStack spacing="md">
                        <HStack justify="between">
                          <h3 className="font-semibold">Offer #{offer.offerId}</h3>
                          {offer.isActive ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Funded
                            </div>
                          )}
                        </HStack>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted">Amount</div>
                            <div className="font-semibold">{offer.loanAmount} ETH</div>
                          </div>
                          <div>
                            <div className="text-muted">Interest Rate</div>
                            <div className="font-semibold">{offer.interestRate / 100}% APY</div>
                          </div>
                          <div>
                            <div className="text-muted">Duration</div>
                            <div className="font-semibold">{formatDuration(offer.duration)}</div>
                          </div>
                          <div>
                            <div className="text-muted">Min Collateral</div>
                            <div className="font-semibold">{offer.minCollateralRatio / 100}%</div>
                          </div>
                        </div>

                        {activeTab === 'marketplace' && offer.isActive && (
                          <Button
                            size="sm"
                            onClick={() => handleFundOffer(offer.offerId)}
                            className="w-full"
                          >
                            Fund This Offer
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const baseScanUrl = `https://basescan.org/address/${contractAddress}`;
                            window.open(baseScanUrl, '_blank');
                          }}
                          className="w-full"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View on BaseScan
                        </Button>
                      </VStack>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

