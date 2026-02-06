'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function ImageUpload({ value, onChange, error }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create/cleanup preview URL when value changes
  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border">
          <Image
            src={previewUrl}
            alt="미리보기"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            onClick={handleRemove}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Upload className="h-8 w-8" />
            <span className="text-sm">이미지를 업로드하세요</span>
            <span className="text-xs">JPG, PNG, WebP (최대 5MB)</span>
          </div>
        </label>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
