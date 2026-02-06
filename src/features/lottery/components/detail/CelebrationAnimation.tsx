'use client';

import { useEffect, useState, useRef } from 'react';

interface CelebrationAnimationProps {
  onComplete?: () => void;
}

// CSS-based confetti for better visibility
const confettiColors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-cyan-500',
];

interface ConfettiPiece {
  id: number;
  color: string;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
}

export function CelebrationAnimation({ onComplete }: CelebrationAnimationProps) {
  const [pieces] = useState<ConfettiPiece[]>(() => {
    // Generate confetti pieces once
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        rotation: Math.random() * 360,
      });
    }
    return newPieces;
  });

  const hasCalledComplete = useRef(false);

  useEffect(() => {
    // Call onComplete after animation (prevent double call in StrictMode)
    const timer = setTimeout(() => {
      if (!hasCalledComplete.current) {
        hasCalledComplete.current = true;
        onComplete?.();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute w-3 h-3 ${piece.color} rounded-sm`}
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            animation: `confetti-fall ${piece.duration}s ease-out ${piece.delay}s forwards`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
