'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { VStack, HStack } from './ui';
import { Card } from './ui/Card';
import { Wallet, ChevronDown, ExternalLink, Copy, Check } from 'lucide-react';
import { getWalletManager, shortenAddress, formatBalance, WalletInfo } from '@/lib/wallet';

interface WalletConnectProps {
  onConnect?: (walletInfo: WalletInfo) => void;
  onDisconnect?: () => void;
  variant?: 'button' | 'card';
}

export function WalletConnect({ onConnect, onDisconnect, variant = 'button' }: WalletConnectProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const walletManager = getWalletManager();

  useEffect(() => {
    // Check if already connected on mount
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const info = await walletManager.getWalletInfo();
      if (info) {
        setWalletInfo(info);
        onConnect?.(info);
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const info = await walletManager.connect();
      setWalletInfo(info);
      onConnect?.(info);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    walletManager.disconnect();
    setWalletInfo(null);
    setIsDropdownOpen(false);
    onDisconnect?.();
  };

  const handleSwitchToBase = async () => {
    try {
      await walletManager.switchToBase();
      // Refresh wallet info after network switch
      await checkWalletConnection();
    } catch (error) {
      console.error('Failed to switch to Base:', error);
    }
  };

  const copyAddress = async () => {
    if (walletInfo?.address) {
      await navigator.clipboard.writeText(walletInfo.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const openInExplorer = () => {
    if (walletInfo?.address) {
      const baseScanUrl = `https://basescan.org/address/${walletInfo.address}`;
      window.open(baseScanUrl, '_blank');
    }
  };

  if (variant === 'card') {
    return (
      <Card className="p-6">
        <VStack spacing="md">
          <HStack justify="between">
            <h3 className="text-lg font-semibold">Wallet Connection</h3>
            {walletInfo && (
              <div className="text-sm text-muted">
                {walletManager.getNetworkName()}
              </div>
            )}
          </HStack>

          {!walletInfo ? (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          ) : (
            <VStack spacing="sm">
              <div className="text-sm text-muted">Connected Wallet</div>
              <div className="font-mono text-sm bg-surface/50 p-2 rounded">
                {shortenAddress(walletInfo.address)}
              </div>
              <div className="text-sm">
                Balance: <span className="font-semibold">{formatBalance(walletInfo.balance)} ETH</span>
              </div>

              {!walletManager.isOnBaseNetwork() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchToBase}
                  className="w-full"
                >
                  Switch to Base Network
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="w-full"
              >
                Disconnect
              </Button>
            </VStack>
          )}
        </VStack>
      </Card>
    );
  }

  // Button variant
  if (!walletInfo) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        variant="outline"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-surface/80 transition-colors"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="font-mono text-sm">
          {shortenAddress(walletInfo.address)}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg z-20 p-4">
            <VStack spacing="md">
              <div className="text-sm font-medium">Wallet Details</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Address</span>
                  <HStack spacing="xs">
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-surface/50 rounded"
                    >
                      {copiedAddress ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={openInExplorer}
                      className="p-1 hover:bg-surface/50 rounded"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </HStack>
                </div>
                <div className="font-mono text-xs bg-bg/50 p-2 rounded">
                  {walletInfo.address}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Balance</span>
                  <span>{formatBalance(walletInfo.balance)} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Network</span>
                  <span>{walletManager.getNetworkName()}</span>
                </div>
              </div>

              {!walletManager.isOnBaseNetwork() && (
                <Button
                  size="sm"
                  onClick={handleSwitchToBase}
                  className="w-full"
                >
                  Switch to Base
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="w-full"
              >
                Disconnect
              </Button>
            </VStack>
          </div>
        </>
      )}
    </div>
  );
}

