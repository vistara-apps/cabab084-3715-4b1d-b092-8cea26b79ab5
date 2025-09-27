'use client';

import { UserReputation, ReputationManager } from '@/lib/reputation';
import { Card } from './ui/Card';
import { VStack, HStack } from './ui';
import { Trophy, Star, Award, Crown } from 'lucide-react';

interface ReputationBadgeProps {
  reputation: UserReputation;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export function ReputationBadge({ reputation, size = 'md', showProgress = true }: ReputationBadgeProps) {
  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'diamond': return <Crown className="w-5 h-5" />;
      case 'platinum': return <Star className="w-5 h-5" />;
      case 'gold': return <Award className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'p-3 text-sm';
      case 'lg': return 'p-6 text-lg';
      default: return 'p-4 text-base';
    }
  };

  const progressBarWidth = reputation.progress || 0;

  return (
    <Card className={`${getSizeClasses()} border-2`} style={{ borderColor: reputation.color }}>
      <VStack spacing="sm">
        <HStack justify="between" className="w-full">
          <HStack spacing="xs">
            <div style={{ color: reputation.color }}>
              {getLevelIcon(reputation.level)}
            </div>
            <div>
              <div className="font-semibold">{reputation.level}</div>
              <div className="text-xs text-muted">
                {reputation.score.toLocaleString()} points
              </div>
            </div>
          </HStack>
        </HStack>

        {showProgress && reputation.nextLevelScore && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Progress to next level</span>
              <span>{reputation.progress}%</span>
            </div>
            <div className="w-full bg-surface/50 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progressBarWidth}%`,
                  backgroundColor: reputation.color
                }}
              />
            </div>
            <div className="text-xs text-muted mt-1">
              {reputation.nextLevelScore - reputation.score} points to {ReputationManager.prototype.getReputationLevel(reputation.nextLevelScore)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs w-full">
          <div className="text-center">
            <div className="font-semibold">{reputation.gamesPlayed}</div>
            <div className="text-muted">Games</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{reputation.gamesWon}</div>
            <div className="text-muted">Wins</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{reputation.loansGiven}</div>
            <div className="text-muted">Lent</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{reputation.loansRepaid}</div>
            <div className="text-muted">Repaid</div>
          </div>
        </div>
      </VStack>
    </Card>
  );
}

// Mini version for headers/navigation
interface ReputationBadgeMiniProps {
  reputation: UserReputation;
}

export function ReputationBadgeMini({ reputation }: ReputationBadgeMiniProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface/50 border" style={{ borderColor: reputation.color }}>
      <div style={{ color: reputation.color }}>
        {reputation.level === 'Diamond' ? <Crown className="w-3 h-3" /> :
         reputation.level === 'Platinum' ? <Star className="w-3 h-3" /> :
         reputation.level === 'Gold' ? <Award className="w-3 h-3" /> :
         <Trophy className="w-3 h-3" />}
      </div>
      <span className="text-sm font-medium">{reputation.level}</span>
      <span className="text-xs text-muted">{reputation.score}</span>
    </div>
  );
}

// Level benefits display
interface ReputationBenefitsProps {
  level: string;
}

export function ReputationBenefits({ level }: ReputationBenefitsProps) {
  const benefits = [
    'Basic platform access',
    'Standard transaction fees',
    'Community support',
  ];

  // Add level-specific benefits
  switch (level.toLowerCase()) {
    case 'silver':
      benefits.push('Priority customer support', 'Lower platform fees');
      break;
    case 'gold':
      benefits.push('Exclusive game access', 'Higher lending limits', 'VIP support');
      break;
    case 'platinum':
      benefits.push('Beta feature access', 'Zero platform fees', 'Dedicated account manager');
      break;
    case 'diamond':
      benefits.push('Governance voting rights', 'Exclusive NFT drops', 'Revenue sharing');
      break;
  }

  return (
    <Card className="p-4">
      <VStack spacing="sm">
        <h3 className="font-semibold">{level} Benefits</h3>
        <ul className="space-y-1 text-sm">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              {benefit}
            </li>
          ))}
        </ul>
      </VStack>
    </Card>
  );
}

