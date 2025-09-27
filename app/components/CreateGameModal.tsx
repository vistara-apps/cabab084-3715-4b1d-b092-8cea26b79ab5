'use client';

import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { VStack, HStack } from './ui';
import { X, Gamepad2 } from 'lucide-react';
import { GAME_TYPES } from '@/lib/constants';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (gameData: any) => void;
}

export function CreateGameModal({ isOpen, onClose, onCreate }: CreateGameModalProps) {
  const [formData, setFormData] = useState({
    type: 'lottery',
    entryFee: '',
    duration: '24',
    maxParticipants: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + parseInt(formData.duration));
      
      await onCreate({
        ...formData,
        endTime,
        entryFee: formData.entryFee,
        maxParticipants: parseInt(formData.maxParticipants) || 100,
      });
      
      onClose();
      setFormData({
        type: 'lottery',
        entryFee: '',
        duration: '24',
        maxParticipants: '',
        description: '',
      });
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <VStack spacing="lg">
            {/* Header */}
            <HStack justify="between">
              <HStack spacing="sm">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-xl font-semibold">Create New Game</h2>
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

            {/* Form */}
            <VStack spacing="md">
              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  Game Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field w-full"
                  required
                >
                  <option value="lottery">Lottery</option>
                  <option value="raffle">Raffle</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>

              <Input
                label="Entry Fee (ETH)"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.01"
                value={formData.entryFee}
                onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                variant="withLabel"
                required
              />

              <Input
                label="Duration (hours)"
                type="number"
                min="1"
                max="168"
                placeholder="24"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                variant="withLabel"
                required
              />

              <Input
                label="Max Participants (optional)"
                type="number"
                min="2"
                placeholder="100"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                variant="withLabel"
              />

              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your game..."
                  className="input-field w-full h-20 resize-none"
                  required
                />
              </div>
            </VStack>

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
              >
                Create Game
              </Button>
            </HStack>
          </VStack>
        </form>
      </Card>
    </div>
  );
}
