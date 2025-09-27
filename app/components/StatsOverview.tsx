'use client';

import { GameStats, LendingStats, UserStats } from '@/lib/types';
import { Card } from './ui/Card';
import { HStack, VStack } from './ui';
import { formatCurrency, formatToken } from '@/lib/utils';
import { 
  Gamepad2, 
  TrendingUp, 
  Users, 
  DollarSign,
  Trophy,
  Shield,
  Percent,
  Target
} from 'lucide-react';

interface StatsOverviewProps {
  gameStats?: GameStats;
  lendingStats?: LendingStats;
  userStats?: UserStats;
}

export function StatsOverview({ gameStats, lendingStats, userStats }: StatsOverviewProps) {
  const platformStats = [
    {
      icon: Gamepad2,
      label: 'Active Games',
      value: gameStats?.activeGames || 0,
      subtext: `${gameStats?.totalGames || 0} total`,
      color: 'text-blue-400',
    },
    {
      icon: DollarSign,
      label: 'Prize Pool',
      value: formatToken(gameStats?.totalPrizePool || '0', 'ETH'),
      subtext: `${gameStats?.totalParticipants || 0} participants`,
      color: 'text-accent',
    },
    {
      icon: TrendingUp,
      label: 'Total Loaned',
      value: formatToken(lendingStats?.totalLoaned || '0', 'ETH'),
      subtext: `${lendingStats?.activeLoans || 0} active loans`,
      color: 'text-green-400',
    },
    {
      icon: Percent,
      label: 'Avg APY',
      value: `${lendingStats?.averageAPY || 0}%`,
      subtext: formatToken(lendingStats?.totalCollateral || '0', 'ETH') + ' collateral',
      color: 'text-purple-400',
    },
  ];

  const userStatsData = userStats ? [
    {
      icon: Trophy,
      label: 'Games Won',
      value: userStats.gamesWon,
      subtext: formatToken(userStats.totalWinnings, 'ETH') + ' won',
      color: 'text-accent',
    },
    {
      icon: TrendingUp,
      label: 'Loans Given',
      value: userStats.loansGiven,
      subtext: `${userStats.loansTaken} taken`,
      color: 'text-green-400',
    },
    {
      icon: Shield,
      label: 'Reputation',
      value: userStats.reputationScore,
      subtext: 'Trust Score',
      color: 'text-blue-400',
    },
  ] : [];

  return (
    <VStack spacing="lg">
      {/* Platform Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((stat, index) => (
            <Card key={index} className="metric-card">
              <VStack spacing="sm">
                <HStack justify="between">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-fg">{stat.value}</p>
                    <p className="text-sm text-muted">{stat.label}</p>
                  </div>
                </HStack>
                <p className="text-xs text-muted">{stat.subtext}</p>
              </VStack>
            </Card>
          ))}
        </div>
      </div>

      {/* User Stats */}
      {userStats && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userStatsData.map((stat, index) => (
              <Card key={index} className="metric-card">
                <VStack spacing="sm">
                  <HStack justify="between">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <div className="text-right">
                      <p className="text-2xl font-bold text-fg">{stat.value}</p>
                      <p className="text-sm text-muted">{stat.label}</p>
                    </div>
                  </HStack>
                  <p className="text-xs text-muted">{stat.subtext}</p>
                </VStack>
              </Card>
            ))}
          </div>
        </div>
      )}
    </VStack>
  );
}
