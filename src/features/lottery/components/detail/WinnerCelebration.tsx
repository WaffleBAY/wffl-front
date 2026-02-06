'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CelebrationAnimation } from './CelebrationAnimation';

interface WinnerCelebrationProps {
  onComplete: () => void;
}

export function WinnerCelebration({ onComplete }: WinnerCelebrationProps) {
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Prevent double toast in StrictMode
    if (hasShownToast.current) return;
    hasShownToast.current = true;

    toast.success('축하합니다! 당첨되셨습니다! 🎉', {
      duration: 4000,
    });
  }, []);

  return <CelebrationAnimation onComplete={onComplete} />;
}
