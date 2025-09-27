'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './components/ui/AppShell';
import { Navigation } from './components/Navigation';
import { StatsOverview } from './components/StatsOverview';
import { GameCard } from './components/GameCard';
import { LoanCard } from './components/LoanCard';
import { CreateGameModal } from './components/CreateGameModal';
import { CreateLoanModal } from './components/CreateLoanModal';
import { Button } from './components/ui/Button';
import { VStack, HStack } from './components/ui';
import { Card } from './components/ui/Card';
import { Game, Loan, GameStats, LendingStats, UserStats } from '@/lib/types';
import { generateGameId, generateLoanId } from '@/lib/utils';
import { Plus, Gamepad2, TrendingUp, Trophy, Zap } from 'lucide-react';

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [isCreateLoanOpen, setIsCreateLoanOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'lending'>('overview');

  // Mock data for demonstration
  useEffect(() => {
    // Initialize with sample data
    const sampleGames: Game[] = [
      {
        gameId: 'game_1',
        type: 'lottery',
        entryFee: '0.01',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 7200000),
        winningConditions: 'Random draw',
        createdAt: new Date(),
        totalPrize: '0.5',
        participantCount: 25,
        status: 'active',
      },
      {
        gameId: 'game_2',
        type: 'raffle',
        entryFee: '0.005',
        startTime: new Date(Date.now() + 1800000),
        endTime: new Date(Date.now() + 10800000),
        winningConditions: 'First 100 participants',
        createdAt: new Date(),
        totalPrize: '0.25',
        participantCount: 0,
        status: 'upcoming',
      },
    ];

    const sampleLoans: Loan[] = [
      {
        loanId: 'loan_1',
        lenderWalletAddress: '0x1234567890123456789012345678901234567890',
        borrowerWalletAddress: '0x0987654321098765432109876543210987654321',
        principalAmount: '1.0',
        interestRate: 12,
        collateralAsset: 'ETH',
        collateralAmount: '1.5',
        loanStatus: 'active',
        createdAt: new Date(),
        liquidationThreshold: 150,
        duration: 30,
        currentValue: '1.5',
      },
      {
        loanId: 'loan_2',
        lenderWalletAddress: '',
        borrowerWalletAddress: '0x1111222233334444555566667777888899990000',
        principalAmount: '0.5',
        interestRate: 15,
        collateralAsset: 'ETH',
        collateralAmount: '0.8',
        loanStatus: 'pending',
        createdAt: new Date(),
        liquidationThreshold: 150,
        duration: 14,
        currentValue: '0.8',
      },
    ];

    setGames(sampleGames);
    setLoans(sampleLoans);
  }, []);

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
  ];

  return (
    <AppShell variant="glass">
      <Navigation />
      
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
        <VStack spacing="lg">
          <HStack justify="between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Lending Marketplace</h1>
              <p className="text-muted">Secure P2P lending with smart contract collateral</p>
            </div>
            <Button
              onClick={() => setIsCreateLoanOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Request Loan
            </Button>
          </HStack>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loans.map((loan) => (
              <LoanCard
                key={loan.loanId}
                loan={loan}
                onAction={handleLoanAction}
              />
            ))}
          </div>
        </VStack>
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
  );
}
