'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useMyEntries } from '../../hooks/useMyEntries';
import { useMyWinnings } from '../../hooks/useMyWinnings';
import { useMyLotteries } from '../../hooks/useMyLotteries';
import { EntryList } from './EntryList';
import { WinningList } from './WinningList';
import { SalesList } from './SalesList';

type TabType = 'entries' | 'winnings' | 'sales';

export function MyPageTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('entries');
  const { _hasHydrated } = useAuthStore();

  const { isLoading: entriesLoading, count: entriesCount } = useMyEntries();
  const { isLoading: winningsLoading, count: winningsCount } = useMyWinnings();
  const { isLoading: salesLoading, count: salesCount } = useMyLotteries();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as TabType)}
    >
      <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto p-1 mb-4">
        <TabsTrigger value="entries" className="shrink-0 px-3 py-1.5 text-sm">
          응모 {_hasHydrated && !entriesLoading ? `(${entriesCount})` : ''}
        </TabsTrigger>
        <TabsTrigger value="winnings" className="shrink-0 px-3 py-1.5 text-sm">
          당첨 {_hasHydrated && !winningsLoading ? `(${winningsCount})` : ''}
        </TabsTrigger>
        <TabsTrigger value="sales" className="shrink-0 px-3 py-1.5 text-sm">
          판매 {_hasHydrated && !salesLoading ? `(${salesCount})` : ''}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="entries">
        <EntryList />
      </TabsContent>
      <TabsContent value="winnings">
        <WinningList />
      </TabsContent>
      <TabsContent value="sales">
        <SalesList />
      </TabsContent>
    </Tabs>
  );
}
