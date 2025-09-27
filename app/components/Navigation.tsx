'use client';

import { useState } from 'react';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';
import { HStack } from './ui/HStack';
import { Button } from './ui/Button';
import { useTheme } from './ThemeProvider';
import { 
  Gamepad2, 
  Coins, 
  Trophy, 
  Settings2, 
  Menu, 
  X,
  Palette
} from 'lucide-react';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems = [
    { icon: Gamepad2, label: 'Games', href: '/games' },
    { icon: Coins, label: 'Lending', href: '/lending' },
    { icon: Trophy, label: 'My Assets', href: '/assets' },
  ];

  const themes = [
    { id: 'default', name: 'FairPlay', color: '#ffd700' },
    { id: 'celo', name: 'Celo', color: '#fbcc5c' },
    { id: 'solana', name: 'Solana', color: '#9945ff' },
    { id: 'base', name: 'Base', color: '#0052ff' },
    { id: 'coinbase', name: 'Coinbase', color: '#0052ff' },
  ];

  return (
    <nav className="glass-card mb-8">
      <div className="px-6 py-4">
        <HStack justify="between" className="w-full">
          {/* Logo */}
          <HStack spacing="sm">
            <div className="w-8 h-8 bg-gradient-to-r from-accent to-yellow-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-bg" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">FairPlay Nexus</h1>
              <p className="text-xs text-muted">Provably Fair Gaming & DeFi</p>
            </div>
          </HStack>

          {/* Desktop Navigation */}
          <HStack spacing="lg" className="hidden md:flex">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </HStack>

          {/* Actions */}
          <HStack spacing="sm">
            {/* Theme Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2"
              >
                <Palette className="w-4 h-4" />
              </Button>
              
              {isThemeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 glass-card p-2 min-w-[150px] z-50">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id as any);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-surface/50 transition-colors flex items-center gap-2 ${
                        theme === t.id ? 'bg-surface/50' : ''
                      }`}
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: t.color }}
                      />
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet Connection */}
            <Wallet>
              <ConnectWallet>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6" />
                  <Name />
                </div>
              </ConnectWallet>
            </Wallet>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </HStack>
        </HStack>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
