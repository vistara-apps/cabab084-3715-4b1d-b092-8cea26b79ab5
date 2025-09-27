'use client';

import { Game } from '@/lib/types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { HStack, VStack } from './ui';
import { formatCurrency, formatTimeRemaining, formatToken } from '@/lib/utils';
import { Clock, Users, Trophy, Zap } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onEnter?: (gameId: string) => void;
}

export function GameCard({ game, onEnter }: GameCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'upcoming': return 'status-pending';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const getGameIcon = (type: string) => {
    switch (type) {
      case 'lottery': return Trophy;
      case 'raffle': return Zap;
      case 'tournament': return Users;
      default: return Trophy;
    }
  };

  const GameIcon = getGameIcon(game.type);

  return (
    <Card className="game-card">
      <VStack spacing="md">
        {/* Header */}
        <HStack justify="between">
          <HStack spacing="sm">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <GameIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold capitalize">{game.type}</h3>
              <p className="text-sm text-muted">#{game.gameId.slice(-8)}</p>
            </div>
          </HStack>
          <span className={getStatusColor(game.status)}>
            {game.status}
          </span>
        </HStack>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">
              {formatToken(game.totalPrize, 'ETH')}
            </p>
            <p className="text-sm text-muted">Total Prize</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-fg">
              {game.participantCount}
            </p>
            <p className="text-sm text-muted">Participants</p>
          </div>
        </div>

        {/* Details */}
        <VStack spacing="sm">
          <HStack justify="between">
            <HStack spacing="xs">
              <Clock className="w-4 h-4 text-muted" />
              <span className="text-sm text-muted">Ends in</span>
            </HStack>
            <span className="text-sm font-medium">
              {formatTimeRemaining(game.endTime)}
            </span>
          </HStack>
          
          <HStack justify="between">
            <span className="text-sm text-muted">Entry Fee</span>
            <span className="text-sm font-medium">
              {formatToken(game.entryFee, 'ETH')}
            </span>
          </HStack>
        </VStack>

        {/* Action */}
        {game.status === 'active' && (
          <Button 
            className="w-full"
            onClick={() => onEnter?.(game.gameId)}
          >
            Enter Game
          </Button>
        )}
        
        {game.status === 'upcoming' && (
          <Button variant="outline" className="w-full" disabled>
            Starts Soon
          </Button>
        )}
        
        {game.status === 'completed' && game.winnerId && (
          <div className="text-center p-3 bg-accent/10 rounded-lg">
            <p className="text-sm text-accent font-medium">
              Winner: {game.winnerId.slice(0, 6)}...{game.winnerId.slice(-4)}
            </p>
          </div>
        )}
      </VStack>
    </Card>
  );
}
