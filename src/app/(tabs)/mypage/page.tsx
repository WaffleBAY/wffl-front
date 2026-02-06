'use client';

import { ProfileCard, LogoutButton } from '@/features/auth';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { MyPageTabs } from '@/features/lottery/components/mypage';
import { PushToggle } from '@/features/settings/components';

export default function MyPage() {
  const { isDevMode, setDevMode } = useAuthStore();
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      {/* Dev Mode Indicator */}
      {isDev && isDevMode && (
        <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-3">
          <div>
            <p className="text-sm font-medium text-orange-600">개발자 모드</p>
            <p className="text-xs text-orange-500">인증 없이 앱을 사용 중입니다</p>
          </div>
          <button
            onClick={() => setDevMode(false)}
            className="rounded-lg bg-orange-200 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-300"
          >
            해제
          </button>
        </div>
      )}

      <ProfileCard />

      {/* Activity Tabs */}
      <div className="border-t pt-4">
        <MyPageTabs />
      </div>

      {/* Settings */}
      <div className="border-t pt-4">
        <h2 className="mb-3 text-lg font-semibold">설정</h2>
        <div className="space-y-2">
          <PushToggle />
        </div>
      </div>

      {/* Logout at bottom */}
      <div className="border-t pt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
