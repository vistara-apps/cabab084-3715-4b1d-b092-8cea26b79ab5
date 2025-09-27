'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './components/ui/AppShell';
import { Navigation } from './components/Navigation';
import { StatsOverview } from './components/StatsOverview';
import { GameCard } from './components/GameCard';
import { LoanCard } from './components/LoanCard';
import { CreateGameModal } from './components/CreateGameModal';
import { CreateLoanModal } from './components/CreateLoanModal';
import { WalletConnect } from './components/WalletConnect';
import { NFTGallery } from './components/NFTGallery';
import { LendingDashboard } from './components/LendingDashboard';
import { ReputationBadge } from './components/ReputationBadge';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from './components/ui/Button';
import { VStack, HStack } from './components/ui';
import { Card } from './components/ui/Card';
import { Game, Loan, GameStats, LendingStats, UserStats, UserReputation } from '@/lib/types';
import { useWallet } from '@/hooks/useWallet';
import { generateGameId, generateLoanId } from '@/lib/utils';
import { Plus, Gamepad2, TrendingUp, Trophy, Zap, Ticket, Users } from 'lucide-react';

export default function HomePage() {
  const { walletInfo, isConnected } = useWallet();
  const [games, setGames] = useState<Game[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [userReputation, setUserReputation] = useState<UserReputation | null>(null);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [isCreateLoanOpen, setIsCreateLoanOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'lending' | 'nfts'>('overview');
  const [loading, setLoading] = useState(false);

  // Load real data from blockchain
  useEffect(() => {
    if (isConnected && walletInfo?.address) {
      loadData();
    }
  }, [isConnected, walletInfo?.address]);

  const loadData = async () => {
    if (!isConnected || !walletInfo?.address) return;

    setLoading(true);
    try {
      // Load games
      const gamesResponse = await fetch(`/api/games?action=active`);
      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json();
        setGames(gamesData.games || []);
      }

      // Load user loans
      const loansResponse = await fetch(`/api/loans?action=user-loans&userAddress=${walletInfo.address}`);
      if (loansResponse.ok) {
        const loansData = await loansResponse.json();
        setLoans(loansData.loans || []);
      }

      // Load user reputation
      const reputationResponse = await fetch(`/api/user?action=reputation&address=${walletInfo.address}`);
      if (reputationResponse.ok) {
        const reputationData = await reputationResponse.json();
        setUserReputation(reputationData.reputation);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const gameStats: GameStats = {
    totalGames: games.length,
    activeGames: games.filter(g => g.status === 'active').length,
    totalPrizePool: games.reduce((sum, g) => sum + parseFloat(g.totalPrize), 0).toString(),
    totalParticipants: games.reduce((sum, g) => sum + g.participantCount, 0),
  };

  const lendingStats: LendingStats = {
    totalLoaned: loans.reduce((sum, l) => sum + parseFloat(l.principalAmount), 0).toString(),
    activeLoans: loans.filter(l => l.loanStatus === 'active').length,
    averageAPY: loans.length > 0 ? loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length : 0,
    totalCollateral: loans.reduce((sum, l) => sum + parseFloat(l.collateralAmount), 0).toString(),
  };

  const userStats: UserStats = {
    gamesWon: 3,
    totalWinnings: '0.75',
    loansGiven: 2,
    loansTaken: 1,
    reputationScore: 750,
  };

  const handleCreateGame = async (gameData: any) => {
    const newGame: Game = {
      gameId: generateGameId(),
      type: gameData.type,
      entryFee: gameData.entryFee,
      startTime: new Date(),
      endTime: gameData.endTime,
      winningConditions: gameData.description,
      createdAt: new Date(),
      totalPrize: '0',
      participantCount: 0,
      status: 'active',
    };
    
    setGames(prev => [newGame, ...prev]);
  };

  const handleCreateLoan = async (loanData: any) => {
    const newLoan: Loan = {
      loanId: generateLoanId(),
      lenderWalletAddress: '',
      borrowerWalletAddress: '0x' + Math.random().toString(16).substr(2, 40),
      principalAmount: loanData.principalAmount,
      interestRate: loanData.interestRate,
      collateralAsset: loanData.collateralAsset,
      collateralAmount: loanData.collateralAmount,
      loanStatus: 'pending',
      createdAt: new Date(),
      liquidationThreshold: loanData.liquidationThreshold,
      duration: loanData.duration,
      currentValue: loanData.collateralAmount,
    };
    
    setLoans(prev => [newLoan, ...prev]);
  };

  const handleEnterGame = (gameId: string) => {
    // In a real app, this would mint an NFT ticket and handle payment
    setGames(prev => prev.map(game => 
      game.gameId === gameId 
        ? { 
            ...game, 
            participantCount: game.participantCount + 1,
            totalPrize: (parseFloat(game.totalPrize) + parseFloat(game.entryFee)).toString()
          }
        : game
    ));
  };

  const handleLoanAction = (loanId: string, action: 'fund' | 'repay' | 'liquidate') => {
    // In a real app, this would interact with smart contracts
    console.log(`${action} loan ${loanId}`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'lending', label: 'Lending', icon: TrendingUp },
    { id: 'nfts', label: 'My NFTs', icon: Ticket },
  ];

  return (
    <ErrorBoundary>
      <AppShell variant="glass">
        <Navigation />

        {/* Wallet Connection & Reputation */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <WalletConnect />
            {userReputation && (
              <ReputationBadge reputation={userReputation} size="sm" />
            )}
          </div>
          {loading && (
            <div className="text-sm text-muted">Loading...</div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
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
        </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <VStack spacing="lg">
          <StatsOverview 
            gameStats={gameStats}
            lendingStats={lendingStats}
            userStats={userStats}
          />
          
          {/* Quick Actions */}
          <Card className="p-6">
            <VStack spacing="md">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setIsCreateGameOpen(true)}
                  className="flex items-center gap-2 justify-center"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Create Game
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateLoanOpen(true)}
                  className="flex items-center gap-2 justify-center"
                >
                  <TrendingUp className="w-4 h-4" />
                  Request Loan
                </Button>
              </div>
            </VStack>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <HStack justify="between" className="mb-4">
                <h2 className="text-xl font-semibold">Active Games</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('games')}
                >
                  View All
                </Button>
              </HStack>
              <VStack spacing="md">
                {games.slice(0, 2).map((game) => (
                  <GameCard
                    key={game.gameId}
                    game={game}
                    onEnter={handleEnterGame}
                  />
                ))}
              </VStack>
            </div>

            <div>
              <HStack justify="between" className="mb-4">
                <h2 className="text-xl font-semibold">Recent Loans</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('lending')}
                >
                  View All
                </Button>
              </HStack>
              <VStack spacing="md">
                {loans.slice(0, 2).map((loan) => (
                  <LoanCard
                    key={loan.loanId}
                    loan={loan}
                    onAction={handleLoanAction}
                  />
                ))}
              </VStack>
            </div>
          </div>
        </VStack>
      )}

      {activeTab === 'games' && (
        <VStack spacing="lg">
          <HStack justify="between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Gaming Arena</h1>
              <p className="text-muted">Provably fair games with blockchain verification</p>
            </div>
            <Button
              onClick={() => setIsCreateGameOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Game
            </Button>
          </HStack>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard
                key={game.gameId}
                game={game}
                onEnter={handleEnterGame}
              />
            ))}
          </div>
        </VStack>
      )}

      {activeTab === 'lending' && (
        <LendingDashboard contractAddress={process.env.NEXT_PUBLIC_LENDING_CONTRACT_ADDRESS} />
      )}

      {activeTab === 'nfts' && (
        <NFTGallery contractAddress={process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS} />
      )}

      {/* Floating Action Button */}
      <button className="floating-action">
        <Zap className="w-6 h-6" />
      </button>

      {/* Modals */}
      <CreateGameModal
        isOpen={isCreateGameOpen}
        onClose={() => setIsCreateGameOpen(false)}
        onCreate={handleCreateGame}
      />

      <CreateLoanModal
        isOpen={isCreateLoanOpen}
        onClose={() => setIsCreateLoanOpen(false)}
        onCreate={handleCreateLoan}
      />
    </AppShell>
    </ErrorBoundary>
  );
}
