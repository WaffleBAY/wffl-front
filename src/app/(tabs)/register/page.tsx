'use client';

import { useState } from 'react';
import { AuthGuard } from '@/features/auth';
import { LotteryCreateForm, LotteryPreview } from '@/features/lottery/components/create';
import type { LotteryCreateFormData } from '@/features/lottery/schemas/lotteryCreateSchema';

export default function RegisterPage() {
  const [previewData, setPreviewData] = useState<{
    formData: Partial<LotteryCreateFormData>;
    previewUrl: string | null;
  } | null>(null);

  const handlePreview = (
    formData: Partial<LotteryCreateFormData>,
    previewUrl: string | null
  ) => {
    setPreviewData({ formData, previewUrl });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="px-4 py-3">
            <h1 className="text-lg font-semibold">복권 등록</h1>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {/* Preview Section (shown when user clicks preview) */}
          {previewData && (
            <LotteryPreview
              formData={previewData.formData}
              previewUrl={previewData.previewUrl}
            />
          )}

          {/* Form Section */}
          <LotteryCreateForm onPreview={handlePreview} />
        </div>
      </div>
    </AuthGuard>
  );
}
