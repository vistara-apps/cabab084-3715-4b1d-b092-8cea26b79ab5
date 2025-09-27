'use client';

import { AppShell } from '../components/ui/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { VStack, HStack } from '../components/ui';
import { useTheme } from '../components/ThemeProvider';
import { Palette, Check } from 'lucide-react';

export default function ThemePreviewPage() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { 
      id: 'default', 
      name: 'FairPlay Finance', 
      description: 'Professional finance theme with gold accents',
      colors: { bg: '#0a1628', accent: '#ffd700', primary: '#1e40af' }
    },
    { 
      id: 'celo', 
      name: 'Celo', 
      description: 'Bold black and yellow Celo branding',
      colors: { bg: '#000000', accent: '#fbcc5c', primary: '#fbcc5c' }
    },
    { 
      id: 'solana', 
      name: 'Solana', 
      description: 'Purple gradient Solana ecosystem',
      colors: { bg: '#1a0d2e', accent: '#9945ff', primary: '#14f195' }
    },
    { 
      id: 'base', 
      name: 'Base', 
      description: 'Clean Base network styling',
      colors: { bg: '#0f172a', accent: '#0052ff', primary: '#0052ff' }
    },
    { 
      id: 'coinbase', 
      name: 'Coinbase', 
      description: 'Official Coinbase brand colors',
      colors: { bg: '#0c1426', accent: '#0052ff', primary: '#0052ff' }
    },
  ];

  return (
    <AppShell>
      <VStack spacing="lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">Theme Preview</h1>
          <p className="text-muted">Choose your preferred visual style</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((t) => (
            <Card 
              key={t.id}
              className={`cursor-pointer transition-all duration-200 ${
                theme === t.id ? 'ring-2 ring-accent' : 'hover:border-accent/50'
              }`}
              onClick={() => setTheme(t.id as any)}
            >
              <VStack spacing="md">
                {/* Theme Preview */}
                <div 
                  className="h-24 rounded-lg relative overflow-hidden"
                  style={{ backgroundColor: t.colors.bg }}
                >
                  <div className="absolute inset-0 p-3">
                    <div 
                      className="w-8 h-8 rounded-lg mb-2"
                      style={{ backgroundColor: t.colors.accent }}
                    />
                    <div className="space-y-1">
                      <div 
                        className="h-2 w-16 rounded"
                        style={{ backgroundColor: t.colors.primary }}
                      />
                      <div className="h-1 w-12 bg-white/30 rounded" />
                    </div>
                  </div>
                  
                  {theme === t.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-bg" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div>
                  <h3 className="font-semibold text-fg">{t.name}</h3>
                  <p className="text-sm text-muted">{t.description}</p>
                </div>

                {/* Color Palette */}
                <HStack spacing="xs">
                  <div 
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: t.colors.bg }}
                    title="Background"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: t.colors.accent }}
                    title="Accent"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: t.colors.primary }}
                    title="Primary"
                  />
                </HStack>
              </VStack>
            </Card>
          ))}
        </div>

        {/* Demo Components */}
        <Card className="p-6">
          <VStack spacing="lg">
            <h2 className="text-2xl font-semibold">Component Preview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="metric-card">
                <VStack spacing="sm">
                  <HStack justify="between">
                    <Palette className="w-5 h-5 text-accent" />
                    <div className="text-right">
                      <p className="text-2xl font-bold text-fg">42</p>
                      <p className="text-sm text-muted">Active Games</p>
                    </div>
                  </HStack>
                  <p className="text-xs text-muted">Sample metric card</p>
                </VStack>
              </Card>

              <Card className="game-card">
                <VStack spacing="sm">
                  <h3 className="font-semibold">Sample Game</h3>
                  <p className="text-sm text-muted">Interactive game card</p>
                  <span className="status-active">Active</span>
                </VStack>
              </Card>

              <Card className="loan-card">
                <VStack spacing="sm">
                  <h3 className="font-semibold">Sample Loan</h3>
                  <p className="text-sm text-muted">Lending marketplace card</p>
                  <span className="status-pending">Pending</span>
                </VStack>
              </Card>
            </div>
          </VStack>
        </Card>
      </VStack>
    </AppShell>
  );
}
