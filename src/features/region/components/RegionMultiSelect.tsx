'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { COUNTRIES, WORLDWIDE, getCountryByCode } from '../constants/countries';

interface RegionMultiSelectProps {
  value: string[];
  onChange: (regions: string[]) => void;
  error?: string;
}

export function RegionMultiSelect({
  value,
  onChange,
  error,
}: RegionMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const isWorldwide = value.includes('WORLDWIDE');

  // Display text logic
  const getDisplayText = () => {
    if (value.length === 0) {
      return '배송 가능 지역 선택';
    }
    if (isWorldwide) {
      return '전 세계';
    }
    if (value.length === 1) {
      const country = getCountryByCode(value[0]);
      return country?.nameKo || value[0];
    }
    return `${value.length}개 국가 선택됨`;
  };

  // Toggle WORLDWIDE - clears all other selections
  const handleWorldwideToggle = () => {
    if (isWorldwide) {
      onChange([]);
    } else {
      onChange(['WORLDWIDE']);
    }
  };

  // Toggle country - clears WORLDWIDE if present
  const handleCountryToggle = (countryCode: string) => {
    const newValue = isWorldwide
      ? [countryCode] // Replace WORLDWIDE with single country
      : value.includes(countryCode)
        ? value.filter((v) => v !== countryCode) // Remove country
        : [...value, countryCode]; // Add country
    onChange(newValue);
  };

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal',
              !value.length && 'text-muted-foreground'
            )}
          >
            {getDisplayText()}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="max-h-[300px] overflow-y-auto">
            {/* WORLDWIDE option */}
            <button
              type="button"
              onClick={handleWorldwideToggle}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors',
                isWorldwide && 'bg-accent'
              )}
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">{WORLDWIDE.nameKo}</span>
              {isWorldwide && <Check className="h-4 w-4 text-primary" />}
            </button>

            {/* Separator */}
            <div className="border-t my-1" />

            {/* Country list */}
            {COUNTRIES.map((country) => {
              const isSelected = value.includes(country.code);
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountryToggle(country.code)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors',
                    isSelected && 'bg-accent'
                  )}
                >
                  <span className="w-4" /> {/* Placeholder for alignment */}
                  <span className="flex-1 text-left">{country.nameKo}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
