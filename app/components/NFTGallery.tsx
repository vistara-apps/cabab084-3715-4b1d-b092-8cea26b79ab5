'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { VStack, HStack } from './ui';
import { TicketData, NFTManager, IPFSManager } from '@/lib/nft';
import { useWallet } from '@/hooks/useWallet';
import { ExternalLink, Trophy, Calendar, DollarSign, Award } from 'lucide-react';
import Image from 'next/image';

interface NFTGalleryProps {
  contractAddress?: string;
}

export function NFTGallery({ contractAddress }: NFTGalleryProps) {
  const { walletInfo, isConnected } = useWallet();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nftManager = new NFTManager(
    // We'll need to get provider from wallet manager
    null as any, // Placeholder - will be set when wallet is connected
    null as any, // Placeholder - will be set when wallet is connected
    contractAddress
  );

  useEffect(() => {
    if (isConnected && walletInfo?.address && contractAddress) {
      loadUserTickets();
    }
  }, [isConnected, walletInfo?.address, contractAddress]);

  const loadUserTickets = async () => {
    if (!walletInfo?.address || !contractAddress) return;

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, we'd get the provider from wallet manager
      // For now, this is a placeholder
      const userTickets = await nftManager.getUserTickets(walletInfo.address);
      setTickets(userTickets);
    } catch (err: any) {
      setError('Failed to load NFT tickets');
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getRarityColor = (ticket: TicketData) => {
    if (ticket.isWinner) return 'border-yellow-400 bg-yellow-400/10';
    return 'border-border bg-surface/50';
  };

  const getStatusBadge = (ticket: TicketData) => {
    if (ticket.isWinner) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
          <Trophy className="w-3 h-3" />
          Winner
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
        <Award className="w-3 h-3" />
        Participant
      </div>
    );
  };

  if (!isConnected) {
    return (
      <Card className="p-8 text-center">
        <VStack spacing="md">
          <div className="text-4xl">🎫</div>
          <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
          <p className="text-muted">Connect your wallet to view your FairPlay Nexus tickets</p>
        </VStack>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <span className="ml-2">Loading your tickets...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <VStack spacing="md">
          <div className="text-red-400 text-4xl">⚠️</div>
          <h3 className="text-lg font-semibold">Error Loading Tickets</h3>
          <p className="text-muted">{error}</p>
          <Button onClick={loadUserTickets} variant="outline">
            Try Again
          </Button>
        </VStack>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <VStack spacing="md">
          <div className="text-4xl">🎫</div>
          <h3 className="text-lg font-semibold">No Tickets Yet</h3>
          <p className="text-muted">You haven't participated in any games yet. Join a game to earn your first ticket!</p>
        </VStack>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Tickets</h2>
          <p className="text-muted">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} collected</p>
        </div>
        <Button onClick={loadUserTickets} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.tokenId} className={`p-6 border-2 ${getRarityColor(ticket)} hover:border-accent/50 transition-all duration-200`}>
            <VStack spacing="md">
              {/* Ticket Image */}
              <div className="relative w-full h-48 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">
                    {ticket.isWinner ? '🏆' : '🎫'}
                  </div>
                </div>
                {getStatusBadge(ticket)}
              </div>

              {/* Ticket Info */}
              <VStack spacing="sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Ticket #{ticket.tokenId}</h3>
                  <span className="text-xs text-muted">ID: {ticket.tokenId}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted" />
                    <span>Game #{ticket.gameId} • {ticket.gameType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted" />
                    <span>Entry: {ticket.entryFee} ETH</span>
                  </div>

                  {ticket.isWinner && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">
                        Prize: {ticket.prizeAmount} ETH
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-muted">
                    Minted: {formatDate(ticket.entryTime)}
                  </div>
                </div>

                {/* Actions */}
                <HStack spacing="sm" className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const baseScanUrl = `https://basescan.org/token/${contractAddress}?a=${ticket.tokenId}`;
                      window.open(baseScanUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // Implement transfer functionality
                      console.log('Transfer ticket:', ticket.tokenId);
                    }}
                  >
                    Transfer
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </Card>
        ))}
      </div>
    </div>
  );
}

