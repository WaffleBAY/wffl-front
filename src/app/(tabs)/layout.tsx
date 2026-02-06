import { BottomTabs } from '@/components/navigation/BottomTabs';
import { Header } from '@/components/navigation/Header';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        {children}
      </main>
      <BottomTabs />
    </div>
  );
}
