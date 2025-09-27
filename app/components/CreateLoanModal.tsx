'use client';

import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { VStack, HStack } from './ui';
import { X, TrendingUp, AlertTriangle } from 'lucide-react';
import { SUPPORTED_TOKENS, COLLATERAL_RATIOS } from '@/lib/constants';
import { calculateLTV } from '@/lib/utils';

interface CreateLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (loanData: any) => void;
}

export function CreateLoanModal({ isOpen, onClose, onCreate }: CreateLoanModalProps) {
  const [formData, setFormData] = useState({
    principalAmount: '',
    principalAsset: 'ETH',
    interestRate: '10',
    duration: '30',
    collateralAmount: '',
    collateralAsset: 'ETH',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const ltv = calculateLTV(
    parseFloat(formData.principalAmount) || 0,
    parseFloat(formData.collateralAmount) || 0
  );

  const requiredCollateralRatio = COLLATERAL_RATIOS[formData.collateralAsset as keyof typeof COLLATERAL_RATIOS] || 150;
  const isValidCollateral = ltv <= (100 / requiredCollateralRatio) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCollateral) return;
    
    setIsSubmitting(true);
    
    try {
      await onCreate({
        ...formData,
        principalAmount: formData.principalAmount,
        interestRate: parseFloat(formData.interestRate),
        duration: parseInt(formData.duration),
        liquidationThreshold: requiredCollateralRatio,
      });
      
      onClose();
      setFormData({
        principalAmount: '',
        principalAsset: 'ETH',
        interestRate: '10',
        duration: '30',
        collateralAmount: '',
        collateralAsset: 'ETH',
      });
    } catch (error) {
      console.error('Failed to create loan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <VStack spacing="lg">
            {/* Header */}
            <HStack justify="between">
              <HStack spacing="sm">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-xl font-semibold">Create Loan Request</h2>
              </HStack>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </HStack>

            {/* Loan Details */}
            <VStack spacing="md">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Amount"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="1.0"
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                  variant="withLabel"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-fg mb-2">
                    Asset
                  </label>
                  <select
                    value={formData.principalAsset}
                    onChange={(e) => setFormData({ ...formData, principalAsset: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    {SUPPORTED_TOKENS.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Interest Rate (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="10"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  variant="withLabel"
                  required
                />
                <Input
                  label="Duration (days)"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  variant="withLabel"
                  required
                />
              </div>
            </VStack>

            {/* Collateral */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Collateral</h3>
              <VStack spacing="md">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Amount"
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="1.5"
                    value={formData.collateralAmount}
                    onChange={(e) => setFormData({ ...formData, collateralAmount: e.target.value })}
                    variant="withLabel"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-fg mb-2">
                      Asset
                    </label>
                    <select
                      value={formData.collateralAsset}
                      onChange={(e) => setFormData({ ...formData, collateralAsset: e.target.value })}
                      className="input-field w-full"
                      required
                    >
                      {SUPPORTED_TOKENS.map((token) => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* LTV Display */}
                {formData.principalAmount && formData.collateralAmount && (
                  <div className={`p-3 rounded-lg border ${
                    isValidCollateral 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <HStack justify="between">
                      <span className="text-sm">LTV Ratio:</span>
                      <span className={`font-medium ${
                        isValidCollateral ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {ltv.toFixed(1)}%
                      </span>
                    </HStack>
                    <p className="text-xs text-muted mt-1">
                      Required: ≤{((100 / requiredCollateralRatio) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}

                {!isValidCollateral && formData.principalAmount && formData.collateralAmount && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <p className="text-sm text-red-400">
                      Insufficient collateral. Increase collateral amount.
                    </p>
                  </div>
                )}
              </VStack>
            </div>

            {/* Actions */}
            <HStack spacing="sm" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={isSubmitting}
                disabled={!isValidCollateral}
              >
                Create Loan
              </Button>
            </HStack>
          </VStack>
        </form>
      </Card>
    </div>
  );
}
