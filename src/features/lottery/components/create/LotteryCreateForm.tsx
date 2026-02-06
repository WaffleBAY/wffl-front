'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { lotteryCreateSchema, type LotteryCreateFormData } from '../../schemas/lotteryCreateSchema';
import { useCreateLottery, type CreateStep } from '../../hooks/useCreateLottery';
import { MarketType } from '../../types';
import { ImageUpload } from './ImageUpload';
import { DepositGuide } from './DepositGuide';
import { MarketTypeSelector } from './MarketTypeSelector';
import { RegionMultiSelect } from '@/features/region';

interface LotteryCreateFormProps {
  onPreview?: (data: Partial<LotteryCreateFormData>, previewUrl: string | null) => void;
}

const ALL_STEP_IDS = ['upload', 'verify', 'sign', 'confirm', 'save'] as const;

function ProgressOverlay({ step }: { step: NonNullable<CreateStep> }) {
  const currentIdx = ALL_STEP_IDS.indexOf(step.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6">
          {ALL_STEP_IDS.map((id, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={id} className="flex items-center flex-1 last:flex-none">
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  done ? 'bg-green-500 text-white' :
                  active ? 'bg-blue-500 text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                )}>
                  {done ? '✓' : i + 1}
                </div>
                {i < ALL_STEP_IDS.length - 1 && (
                  <div className={cn(
                    'mx-1 h-0.5 flex-1 transition-colors',
                    i < currentIdx ? 'bg-green-500' : 'bg-gray-200'
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current step info */}
        <h3 className="text-lg font-semibold text-center mb-2">{step.label}</h3>
        <p className="text-sm text-gray-500 text-center leading-relaxed">{step.desc}</p>

        {/* Loading spinner */}
        <div className="flex justify-center mt-5">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        </div>
      </div>
    </div>
  );
}

export function LotteryCreateForm({ onPreview }: LotteryCreateFormProps) {
  const { isSubmitting, currentStep, submit } = useCreateLottery();

  const form = useForm<LotteryCreateFormData>({
    resolver: zodResolver(lotteryCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      marketType: MarketType.LOTTERY,
      title: '',
      description: '',
      entryPrice: 0.1,
      targetAmount: 10,
      winnerCount: 1,
      shippingRegions: ['WORLDWIDE'],
    },
  });

  const { control, handleSubmit, watch, formState: { errors } } = form;

  // Watch values for preview and deposit calculation
  const watchedValues = watch();
  const imageFile = watch('imageFile');

  // Trigger preview callback when values change
  const handlePreviewClick = () => {
    if (onPreview) {
      const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;
      onPreview(watchedValues, previewUrl);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    await submit(data);
  });

  return (
    <>
    {currentStep && <ProgressOverlay step={currentStep} />}
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>상품 이미지 *</Label>
        <Controller
          name="imageFile"
          control={control}
          render={({ field }) => (
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              error={errors.imageFile?.message}
            />
          )}
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">상품명 *</Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="title"
              placeholder="상품명을 입력하세요"
              aria-invalid={!!errors.title}
            />
          )}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">상품 설명 *</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="description"
              placeholder="상품에 대한 상세 설명을 입력하세요 (최소 10자)"
              rows={4}
              aria-invalid={!!errors.description}
            />
          )}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Market Type */}
      <div className="space-y-2">
        <Label>마켓 타입 *</Label>
        <Controller
          name="marketType"
          control={control}
          render={({ field }) => (
            <MarketTypeSelector
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Entry Price */}
      <div className="space-y-2">
        <Label htmlFor="entryPrice">응모 금액 (WLD) *</Label>
        <Controller
          name="entryPrice"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="entryPrice"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0.1"
              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              aria-invalid={!!errors.entryPrice}
            />
          )}
        />
        {errors.entryPrice && (
          <p className="text-sm text-destructive">{errors.entryPrice.message}</p>
        )}
      </div>

      {/* Target Amount */}
      <div className="space-y-2">
        <Label htmlFor="targetAmount">목표 금액 (WLD) *</Label>
        <Controller
          name="targetAmount"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="targetAmount"
              type="number"
              step="1"
              min="0"
              placeholder="10"
              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              aria-invalid={!!errors.targetAmount}
            />
          )}
        />
        {errors.targetAmount && (
          <p className="text-sm text-destructive">{errors.targetAmount.message}</p>
        )}
      </div>

      {/* Deposit Guide (CREATE-02) */}
      <DepositGuide
        targetAmount={watchedValues.targetAmount || 0}
        marketType={watchedValues.marketType || MarketType.LOTTERY}
      />

      {/* Winner Count */}
      <div className="space-y-2">
        <Label htmlFor="winnerCount">당첨 인원 *</Label>
        <Controller
          name="winnerCount"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="winnerCount"
              type="number"
              step="1"
              min="1"
              max="100"
              placeholder="1"
              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              aria-invalid={!!errors.winnerCount}
            />
          )}
        />
        {errors.winnerCount && (
          <p className="text-sm text-destructive">{errors.winnerCount.message}</p>
        )}
      </div>

      {/* Shipping Regions */}
      <div className="space-y-2">
        <Label>배송 가능 지역 *</Label>
        <Controller
          name="shippingRegions"
          control={control}
          render={({ field }) => (
            <RegionMultiSelect
              value={field.value || []}
              onChange={field.onChange}
              error={errors.shippingRegions?.message}
            />
          )}
        />
      </div>

      {/* Expiry Date */}
      <div className="space-y-2">
        <Label>만료 날짜 *</Label>
        <Controller
          name="expiresAt"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value
                    ? format(field.value, 'PPP', { locale: ko })
                    : '날짜를 선택하세요'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date <= new Date()}
                  locale={ko}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.expiresAt && (
          <p className="text-sm text-destructive">{errors.expiresAt.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handlePreviewClick}
        >
          미리보기
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : '복권 등록'}
        </Button>
      </div>
    </form>
    </>
  );
}
