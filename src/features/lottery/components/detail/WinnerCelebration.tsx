'use client';

import { CelebrationAnimation } from './CelebrationAnimation';

interface WinnerCelebrationProps {
  onComplete: () => void;
}

export function WinnerCelebration({ onComplete }: WinnerCelebrationProps) {
  return <CelebrationAnimation onComplete={onComplete} />;
}
