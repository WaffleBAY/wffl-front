# World SDK(MiniKit) 사용법 가이드

> 마지막 업데이트: 2026-02-04
> 대상 독자: 프론트엔드 개발자

## 개요

MiniKit은 World App 내에서 실행되는 Mini App을 위한 공식 SDK입니다. World App의 네이티브 기능(World ID 인증, 지갑 연결, 결제, 스마트 컨트랙트 호출)을 JavaScript/TypeScript로 쉽게 사용할 수 있게 해줍니다.

### MiniKit을 사용하는 이유

- **World ID 인증**: Orb 또는 디바이스 레벨의 인증을 통해 사용자가 고유한 인간임을 증명
- **지갑 통합**: World App의 내장 지갑을 사용하여 별도 지갑 연결 없이 바로 사용
- **결제 처리**: WLD, ETH, USDC 등 다양한 토큰으로 결제 수행
- **컨트랙트 호출**: World Chain의 스마트 컨트랙트와 직접 상호작용

## 사전 요구사항

- Node.js 18 이상
- `@worldcoin/minikit-js` 패키지 설치
- `@worldcoin/minikit-react` 패키지 설치 (React 프로젝트인 경우)
- [Developer Portal](https://developer.worldcoin.org)에서 앱 등록 완료

## 설치 및 초기 설정

### 패키지 설치

```bash
# npm 사용 시
npm install @worldcoin/minikit-js @worldcoin/minikit-react

# pnpm 사용 시
pnpm add @worldcoin/minikit-js @worldcoin/minikit-react

# yarn 사용 시
yarn add @worldcoin/minikit-js @worldcoin/minikit-react
```

### MiniKitProvider 설정

React 앱에서 MiniKit을 사용하려면 앱의 최상위에 `MiniKitProvider`를 설정해야 합니다.

```tsx
// app/providers.tsx
'use client';

import { MiniKitProvider } from '@worldcoin/minikit-react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider
      appId="app_staging_..." // Developer Portal에서 발급받은 앱 ID
    >
      {children}
    </MiniKitProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Commands 전체 목록

MiniKit은 다음과 같은 Commands를 제공합니다.

| Command | 설명 | 주요 용도 |
|---------|------|----------|
| `verify` | World ID 인증 | 사용자가 고유한 인간임을 증명 |
| `walletAuth` | 지갑 인증/연결 | SIWE 기반 로그인 |
| `pay` | 결제 처리 | WLD/ETH/USDC 결제 |
| `sendTransaction` | 컨트랙트 호출 | 스마트 컨트랙트 함수 실행 |
| `shareContacts` | 연락처 공유 | World App 사용자 연락처 선택 |

각 커맨드는 `MiniKit.commandsAsync` 또는 `MiniKit.commands`를 통해 호출합니다. `commandsAsync`는 Promise를 반환하여 `await` 사용이 가능합니다.

---

## verify 커맨드 (World ID 인증)

`verify` 커맨드는 사용자가 World ID로 인증된 고유한 인간임을 증명합니다. Orb 인증(홍채 스캔)과 Device 인증(전화번호) 두 가지 레벨이 있습니다.

### 기본 사용법

```typescript
// lib/minikit/verify.ts
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';

export async function verifyWorldId(action: string) {
  // verify 커맨드 실행
  const { commandPayload, finalPayload } = await MiniKit.commandsAsync.verify({
    action, // Developer Portal에서 생성한 액션 ID
    verification_level: VerificationLevel.Orb, // 'orb' | 'device'
  });

  if (finalPayload.status === 'success') {
    // 백엔드로 proof 전송하여 검증 필수!
    return {
      proof: finalPayload.proof,
      merkle_root: finalPayload.merkle_root,
      nullifier_hash: finalPayload.nullifier_hash,
      verification_level: finalPayload.verification_level,
    };
  }

  throw new Error('Verification failed');
}
```

### 파라미터 설명

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `action` | `string` | O | Developer Portal에서 생성한 액션 ID (예: `buy-lottery-ticket`) |
| `verification_level` | `'orb' \| 'device'` | X | 인증 레벨 (기본값: `orb`) |
| `signal` | `string` | X | 추가 검증 데이터 (예: 사용자 ID) |

### 응답 구조

```typescript
// 성공 시 finalPayload
{
  status: 'success',
  proof: string,           // ZK Proof 데이터
  merkle_root: string,     // Merkle 트리 루트
  nullifier_hash: string,  // 고유 식별자 (액션별 중복 방지)
  verification_level: 'orb' | 'device',
}

// 실패 시 finalPayload
{
  status: 'error',
  error_code: string,      // 에러 코드
}
```

### 백엔드 검증 방법 (verifyCloudProof)

**중요**: 프론트엔드에서 받은 proof는 반드시 백엔드에서 검증해야 합니다. 프론트엔드만으로는 위변조를 막을 수 없습니다.

```typescript
// app/api/verify/route.ts
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js';

export async function POST(request: Request) {
  const body = await request.json();
  const { proof, merkle_root, nullifier_hash, verification_level, action, signal } = body;

  // Cloud Proof 검증
  const verifyResult = await verifyCloudProof({
    proof,
    merkle_root,
    nullifier_hash,
    verification_level,
    action,
    signal,
    app_id: process.env.WORLD_APP_ID!,
  });

  if (verifyResult.success) {
    // nullifier_hash를 저장하여 중복 검증 방지
    // 사용자 세션 생성 또는 권한 부여
    return Response.json({ success: true });
  }

  return Response.json({ success: false, error: verifyResult.error }, { status: 400 });
}
```

### 에러 처리

```typescript
// 에러 코드별 처리
const errorMessages: Record<string, string> = {
  'verification_rejected': '사용자가 인증을 취소했습니다.',
  'already_verified': '이미 이 액션에 대해 인증했습니다.',
  'verification_failed': '인증에 실패했습니다. 다시 시도해주세요.',
  'max_verifications_reached': '최대 인증 횟수에 도달했습니다.',
  'credential_expired': '인증 자격이 만료되었습니다.',
};

function handleVerifyError(errorCode: string) {
  const message = errorMessages[errorCode] || '알 수 없는 오류가 발생했습니다.';
  console.error(`Verify error: ${errorCode}`);
  return message;
}
```

---

## walletAuth 커맨드 (지갑 연결/로그인)

`walletAuth` 커맨드는 SIWE(Sign-In with Ethereum) 표준을 사용하여 사용자의 지갑 주소를 인증합니다. 세션 기반 로그인에 사용됩니다.

### 기본 사용법

```typescript
// lib/minikit/wallet-auth.ts
import { MiniKit } from '@worldcoin/minikit-js';

export async function connectWallet(nonce: string) {
  // nonce는 최소 8자리 영숫자, 서버에서 생성
  const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
    nonce,
    expirationTime: new Date(Date.now() + 1000 * 60 * 10), // 10분 후 만료
    statement: 'World Lottery 서비스에 로그인합니다.',
    requestId: crypto.randomUUID(), // 선택적
  });

  if (finalPayload.status === 'success') {
    // 백엔드에서 verifySiweMessage로 서명 검증 필수!
    return {
      message: finalPayload.message,
      signature: finalPayload.signature,
      address: finalPayload.address,
    };
  }

  throw new Error('Wallet auth failed');
}
```

### SIWE 플로우 설명

1. **Nonce 생성**: 서버에서 랜덤 nonce 생성 및 저장
2. **서명 요청**: 클라이언트에서 `walletAuth` 호출
3. **사용자 승인**: World App에서 사용자가 서명 승인
4. **서명 검증**: 서버에서 `verifySiweMessage`로 서명 유효성 검증
5. **Nonce 삭제**: 사용된 nonce는 재사용 방지를 위해 삭제

### nonce 관리 (서버 생성 -> 저장 -> 검증 -> 삭제)

```typescript
// app/api/nonce/route.ts
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

// Nonce 저장소 (실제로는 Redis나 DB 사용)
const nonceStore = new Map<string, { nonce: string; createdAt: number }>();

export async function GET() {
  // 최소 8자리 영숫자 nonce 생성
  const nonce = nanoid(16);

  // 세션 ID 생성 및 저장
  const sessionId = nanoid();
  nonceStore.set(sessionId, { nonce, createdAt: Date.now() });

  // 쿠키에 세션 ID 저장
  const cookieStore = await cookies();
  cookieStore.set('auth_session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 10, // 10분
  });

  return Response.json({ nonce });
}
```

### verifySiweMessage 사용법

```typescript
// app/api/auth/verify/route.ts
import { verifySiweMessage, MiniAppWalletAuthSuccessPayload } from '@worldcoin/minikit-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;

  if (!sessionId) {
    return Response.json({ error: 'No session' }, { status: 401 });
  }

  // 저장된 nonce 조회
  const stored = nonceStore.get(sessionId);
  if (!stored) {
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  }

  const body: MiniAppWalletAuthSuccessPayload = await request.json();

  // SIWE 메시지 검증
  const isValid = await verifySiweMessage(body, stored.nonce);

  // 사용된 nonce 삭제 (재사용 방지)
  nonceStore.delete(sessionId);

  if (isValid) {
    // 사용자 세션 생성
    return Response.json({
      success: true,
      address: body.address,
    });
  }

  return Response.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### 에러 처리

```typescript
const walletAuthErrors: Record<string, string> = {
  'user_rejected': '사용자가 인증을 거부했습니다.',
  'invalid_nonce': 'Nonce가 유효하지 않습니다.',
  'expired': '인증 요청이 만료되었습니다.',
  'network_error': '네트워크 오류가 발생했습니다.',
};
```

---

## pay 커맨드 (결제)

`pay` 커맨드는 WLD, ETH, USDC 등의 토큰으로 결제를 처리합니다. 결제는 World App 지갑에서 직접 이루어집니다.

### 기본 사용법

```typescript
// lib/minikit/pay.ts
import { MiniKit, tokenToDecimals, Tokens } from '@worldcoin/minikit-js';

export async function payForTicket(
  reference: string,   // 고유 거래 ID (서버에서 생성)
  toAddress: string,   // 수신 주소 (Developer Portal에서 화이트리스트 필요)
  amount: number       // USDC 금액
) {
  const { finalPayload } = await MiniKit.commandsAsync.pay({
    reference,
    to: toAddress,
    tokens: [{
      symbol: Tokens.USDCE,
      token_amount: tokenToDecimals(amount, Tokens.USDCE).toString(),
    }],
    description: '복권 티켓 구매',
  });

  if (finalPayload.status === 'success') {
    // 중요: 백엔드에서 트랜잭션 상태 확인 필수!
    return finalPayload.transaction_id;
  }

  throw new Error('Payment failed');
}
```

### tokenToDecimals 함수 사용

토큰마다 소수점 자릿수(decimals)가 다르므로, `tokenToDecimals` 헬퍼 함수를 사용해야 합니다.

```typescript
import { tokenToDecimals, Tokens } from '@worldcoin/minikit-js';

// 1 USDC = 1000000 (6 decimals)
const usdcAmount = tokenToDecimals(1, Tokens.USDCE).toString(); // "1000000"

// 1 WLD = 1000000000000000000 (18 decimals)
const wldAmount = tokenToDecimals(1, Tokens.WLD).toString();

// 지원되는 토큰
const supportedTokens = {
  WLD: Tokens.WLD,     // 18 decimals
  USDCE: Tokens.USDCE, // 6 decimals (USDC)
  // ETH는 네이티브 토큰으로 별도 처리
};
```

### 백엔드 검증 API 호출

결제 완료 후 반드시 백엔드에서 트랜잭션 상태를 확인해야 합니다.

```typescript
// app/api/payment/verify/route.ts
export async function POST(request: Request) {
  const { transactionId, reference } = await request.json();

  // Developer Portal API로 트랜잭션 상태 확인
  const response = await fetch(
    `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${process.env.WORLD_APP_ID}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.WORLD_DEV_PORTAL_API_KEY}`,
      },
    }
  );

  const transaction = await response.json();

  if (transaction.status === 'confirmed' && transaction.reference === reference) {
    // 결제 완료 처리
    return Response.json({ success: true });
  }

  return Response.json({ success: false }, { status: 400 });
}
```

### 에러 처리

```typescript
const payErrors: Record<string, string> = {
  'user_rejected': '사용자가 결제를 취소했습니다.',
  'insufficient_balance': '잔액이 부족합니다.',
  'invalid_recipient': '수신 주소가 유효하지 않습니다.',
  'recipient_not_whitelisted': '수신 주소가 화이트리스트에 없습니다.',
  'transaction_failed': '트랜잭션 실패. 다시 시도해주세요.',
};
```

---

## sendTransaction 커맨드 (스마트 컨트랙트 호출)

`sendTransaction` 커맨드는 World Chain의 스마트 컨트랙트 함수를 호출합니다. NFT 민팅, 복권 참여 등 온체인 작업에 사용됩니다.

### 기본 사용법

```typescript
// lib/minikit/transaction.ts
import { MiniKit } from '@worldcoin/minikit-js';

export async function purchaseLotteryTicket(
  contractAddress: string,
  lotteryId: number
) {
  // ABI는 호출하는 함수만 포함 (전체 ABI 불필요)
  const abi = [{
    name: 'purchaseTicket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'lotteryId', type: 'uint256' }],
    outputs: [],
  }] as const;

  const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
    transaction: [{
      address: contractAddress,
      abi,
      functionName: 'purchaseTicket',
      args: [lotteryId.toString()], // 인자는 문자열로 변환
    }],
  });

  if (finalPayload.status === 'success') {
    return finalPayload.transaction_id;
  }

  throw new Error('Transaction failed');
}
```

### ABI 형식 (부분 ABI 사용 권장)

전체 컨트랙트 ABI가 아닌, 호출하는 함수만 포함하는 부분 ABI를 사용하면 번들 크기를 줄일 수 있습니다.

```typescript
// 부분 ABI 예시 (권장)
const partialAbi = [{
  name: 'purchaseTicket',
  type: 'function',
  stateMutability: 'payable',
  inputs: [
    { name: 'lotteryId', type: 'uint256' },
    { name: 'ticketCount', type: 'uint256' },
  ],
  outputs: [{ name: 'ticketIds', type: 'uint256[]' }],
}] as const;

// 전체 ABI에서 추출하는 패턴
import fullAbi from '@/contracts/Lottery.json';
const purchaseTicketAbi = fullAbi.abi.filter(
  (item) => item.type === 'function' && item.name === 'purchaseTicket'
);
```

### 컨트랙트 허용목록 설정

**중요**: `sendTransaction`은 Developer Portal에서 허용목록에 등록된 컨트랙트만 호출할 수 있습니다.

1. [Developer Portal](https://developer.worldcoin.org) 접속
2. 앱 선택 > Configuration > Advanced
3. "Contract Allowlist"에 컨트랙트 주소 추가
4. 함수별 허용 설정 (선택사항)

### 가스 제한 및 multicall

```typescript
// 여러 트랜잭션을 한 번에 호출 (multicall)
const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
  transaction: [
    {
      address: contractAddress1,
      abi: abi1,
      functionName: 'approve',
      args: [spender, amount.toString()],
    },
    {
      address: contractAddress2,
      abi: abi2,
      functionName: 'deposit',
      args: [amount.toString()],
    },
  ],
  // 가스 설정 (선택사항)
  // gas: '100000', // 직접 지정 시
});
```

### 에러 처리

```typescript
const txErrors: Record<string, string> = {
  'user_rejected': '사용자가 트랜잭션을 거부했습니다.',
  'contract_not_allowed': '허용되지 않은 컨트랙트입니다. Developer Portal에서 허용목록을 확인하세요.',
  'execution_reverted': '컨트랙트 실행 실패. 조건을 확인하세요.',
  'insufficient_funds': 'ETH 잔액이 부족합니다 (가스비).',
  'gas_limit_exceeded': '가스 한도 초과. 트랜잭션을 간소화하세요.',
};
```

---

## MiniKit.isInstalled() 체크

Mini App이 World App 내에서 실행되는지 확인합니다. World App 밖에서는 MiniKit 기능이 작동하지 않습니다.

### 기본 사용법

```typescript
import { MiniKit } from '@worldcoin/minikit-js';

export function useMiniKitAvailable() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // MiniKit이 설치되어 있는지 확인
    if (MiniKit.isInstalled()) {
      setIsAvailable(true);
    }
  }, []);

  return isAvailable;
}
```

### World App 밖에서의 폴백 UI

```tsx
// components/MiniKitRequired.tsx
'use client';

import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect, useState } from 'react';

export function MiniKitRequired({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 하이드레이션 후 체크
    setIsReady(true);
    setIsInstalled(MiniKit.isInstalled());
  }, []);

  if (!isReady) {
    return null; // SSR 중 렌더링 방지
  }

  if (!isInstalled) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold mb-4">World App이 필요합니다</h2>
        <p className="text-muted-foreground mb-4">
          이 기능은 World App 내에서만 사용할 수 있습니다.
        </p>
        <a
          href="https://worldcoin.org/download"
          className="bg-primary text-white px-6 py-3 rounded-lg"
        >
          World App 다운로드
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## 문제 해결 (Troubleshooting)

| 문제 | 원인 | 해결 방법 |
|------|------|----------|
| `MiniKit.isInstalled()` 항상 false | World App 밖에서 실행 | World App에서 Mini App URL로 접속 |
| verify 응답이 항상 error | action ID 불일치 | Developer Portal의 action ID 확인 |
| walletAuth에서 Invalid nonce | nonce 재사용 또는 만료 | 서버에서 새 nonce 발급 |
| pay에서 recipient_not_whitelisted | 수신 주소 미등록 | Developer Portal에서 주소 화이트리스트 |
| sendTransaction 컨트랙트 호출 실패 | 컨트랙트 미등록 | Developer Portal에서 Contract Allowlist 설정 |
| 트랜잭션 실패 (execution_reverted) | 컨트랙트 조건 불충족 | require 조건 확인 (잔액, 권한 등) |
| 프론트엔드에서 검증 성공, 백엔드 실패 | proof 위변조 시도 | 정상 동작. 항상 백엔드 검증 결과 사용 |

---

## 참고 자료

### 공식 문서
- [MiniKit 공식 문서](https://docs.world.org/mini-apps) - 전체 API 레퍼런스
- [verify 커맨드](https://docs.world.org/mini-apps/commands/verify) - World ID 인증
- [walletAuth 커맨드](https://docs.world.org/mini-apps/commands/wallet-auth) - SIWE 인증
- [pay 커맨드](https://docs.world.org/mini-apps/commands/pay) - 결제 처리
- [sendTransaction 커맨드](https://docs.world.org/mini-apps/commands/send-transaction) - 컨트랙트 호출

### GitHub
- [minikit-js 저장소](https://github.com/worldcoin/minikit-js) - SDK 소스 코드
- [minikit-react 저장소](https://github.com/worldcoin/minikit-react) - React 바인딩

### Developer Portal
- [World Developer Portal](https://developer.worldcoin.org) - 앱 등록 및 설정
