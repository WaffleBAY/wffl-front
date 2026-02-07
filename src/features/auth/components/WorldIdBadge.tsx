'use client';

interface WorldIdBadgeProps {
  verified: boolean;
}

export function WorldIdBadge({ verified }: WorldIdBadgeProps) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-green/15 px-3 py-1 text-sm font-medium text-neon-green">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        인증됨
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground">
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      미인증
    </span>
  );
}
