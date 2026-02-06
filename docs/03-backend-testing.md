# 백엔드 통신 테스트 가이드

> 마지막 업데이트: 2026-02-04
> 대상 독자: 프론트엔드/백엔드 개발자

## 개요

이 문서는 World Mini App에서 MiniKit 명령어를 사용할 때 **백엔드 검증이 왜 필수인지**, 그리고 개발 환경에서 **Mock 서버와 ABI를 어떻게 연동하는지** 설명합니다.

MiniKit은 프론트엔드에서 World App과 통신하지만, 보안상 모든 검증은 **반드시 백엔드에서 수행**해야 합니다. 프론트엔드 응답만으로 인증이나 결제를 처리하면 심각한 보안 취약점이 발생합니다.

## 백엔드 검증이 필요한 이유

### 프론트엔드 응답은 조작 가능

MiniKit 명령어의 응답은 JavaScript 객체입니다. 악의적인 사용자는 브라우저 개발자 도구를 통해 이 응답을 조작할 수 있습니다.

```typescript
// 위험: 프론트엔드에서만 응답 확인
const { finalPayload } = await MiniKit.commandsAsync.verify({ action });
if (finalPayload.status === 'success') {
  // 여기서 바로 처리하면 안 됨!
  // 악의적 사용자가 status를 조작할 수 있음
}
```

### 각 커맨드별 백엔드 검증 필수 사항

| 커맨드 | 프론트엔드 응답 | 백엔드 검증 방법 |
|--------|----------------|------------------|
| verify | proof, merkle_root, nullifier_hash | `verifyCloudProof()` 함수 사용 |
| walletAuth | message, signature, address | `verifySiweMessage()` 함수 사용 |
| pay | transaction_id | Developer Portal API로 트랜잭션 상태 확인 |
| sendTransaction | transaction_id | 블록체인에서 트랜잭션 결과 확인 |

## Mock 서버 설정

개발 환경에서 MiniKit 명령어를 테스트하려면 Mock 서버가 필요합니다. MiniKit은 World App 내부에서만 작동하기 때문에 로컬 개발 시 API 응답을 모킹해야 합니다.

### 방법 1: MSW (Mock Service Worker)

MSW는 Service Worker를 사용해 네트워크 요청을 가로채는 도구입니다. 실제 API 호출 코드를 수정하지 않고도 응답을 모킹할 수 있습니다.

#### 설치

```bash
pnpm add -D msw
```

#### 핸들러 정의

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // World ID 검증 API Mock
  http.post('/api/verify', async ({ request }) => {
    const body = await request.json();

    // Mock 성공 응답
    return HttpResponse.json({
      success: true,
      nullifier_hash: body.nullifier_hash,
      verified: true,
    });
  }),

  // 트랜잭션 상태 조회 API Mock
  http.get('https://developer.worldcoin.org/api/v2/minikit/transaction/:id', () => {
    return HttpResponse.json({
      transactionId: 'mock-tx-id',
      transactionHash: '0x123...',
      transactionStatus: 'mined',
    });
  }),

  // SIWE 검증 API Mock
  http.post('/api/wallet-auth', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      address: body.address,
      isValid: true,
    });
  }),
];
```

#### 브라우저에서 사용

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// src/app/layout.tsx 또는 진입점에서
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
```

#### Node.js 테스트에서 사용

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// vitest.setup.ts 또는 jest.setup.ts
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 방법 2: Next.js API Route Mock

기존 프로젝트의 `src/repositories/mock` 패턴을 활용하면 환경 변수로 Mock 모드를 전환할 수 있습니다.

```typescript
// src/repositories/mock/lottery.mock.ts
export const mockLotteryRepository = {
  async verifyWorldId(proof: WorldIdProof) {
    // 개발용 Mock 응답
    return {
      success: true,
      verified: true,
      nullifier_hash: proof.nullifier_hash,
    };
  },

  async verifyTransaction(transactionId: string) {
    // Mock 트랜잭션 상태
    return {
      transactionId,
      status: 'mined',
      hash: '0x' + '1'.repeat(64),
    };
  },
};
```

```typescript
// src/repositories/index.ts
import { mockLotteryRepository } from './mock/lottery.mock';
import { realLotteryRepository } from './real/lottery.real';

export const lotteryRepository =
  process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
    ? mockLotteryRepository
    : realLotteryRepository;
```

### Mock 데이터 관리

일관된 테스트 데이터를 유지하려면 Mock 데이터를 중앙에서 관리하세요.

```typescript
// src/mocks/data/fixtures.ts
export const mockUser = {
  address: '0x1234567890123456789012345678901234567890',
  nullifierHash: 'mock_nullifier_hash_12345',
  verificationLevel: 'orb' as const,
};

export const mockTransaction = {
  id: 'mock-tx-001',
  hash: '0x' + 'a'.repeat(64),
  status: 'mined' as const,
  blockNumber: 12345,
};

export const mockProof = {
  proof: '0x...',
  merkle_root: '0x...',
  nullifier_hash: mockUser.nullifierHash,
  verification_level: 'orb',
};
```

## 컨트랙트 ABI 연동

### ABI란?

ABI(Application Binary Interface)는 스마트 컨트랙트와 통신하기 위한 인터페이스 정의입니다. 함수 이름, 파라미터 타입, 반환 타입을 JSON 형식으로 정의합니다.

### ABI JSON 파일 관리

프로젝트에서 ABI 파일은 다음과 같이 구성하는 것을 권장합니다:

```
src/
└── contracts/
    └── abis/
        ├── Lottery.json       # 전체 ABI (배포 시 생성)
        ├── LotteryPartial.ts  # 사용하는 함수만 정의
        └── types.ts           # TypeScript 타입
```

### sendTransaction에서 ABI 사용법

MiniKit의 `sendTransaction`은 ABI를 사용해 컨트랙트 함수를 호출합니다.

#### 전체 ABI 사용 (비권장)

```typescript
// 전체 ABI는 번들 크기가 커짐
import LotteryABI from '@/contracts/abis/Lottery.json';

const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
  transaction: [{
    address: contractAddress,
    abi: LotteryABI,
    functionName: 'purchaseTicket',
    args: [lotteryId.toString()],
  }],
});
```

#### 부분 ABI 사용 (권장)

```typescript
// 부분 ABI: 호출하는 함수만 정의
// 번들 크기 최소화, 타입 안전성 유지
const purchaseTicketABI = [{
  name: 'purchaseTicket',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [{ name: 'lotteryId', type: 'uint256' }],
  outputs: [],
}] as const;

const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
  transaction: [{
    address: contractAddress,
    abi: purchaseTicketABI,
    functionName: 'purchaseTicket',
    args: [lotteryId.toString()], // 인자는 문자열로 변환 필수
  }],
});
```

**부분 ABI 권장 이유:**
- 번들 크기 감소 (전체 ABI는 수십 KB)
- 필요한 함수만 명시적으로 정의
- 타입 안전성 유지 (`as const` 사용)

### ABI 타입 생성 (선택사항)

TypeScript 타입을 자동 생성하려면 wagmi CLI를 사용할 수 있습니다.

```bash
# wagmi CLI 설치
pnpm add -D @wagmi/cli

# wagmi.config.ts 생성
# ABI에서 타입 생성
pnpm wagmi generate
```

또는 수동으로 타입을 정의할 수 있습니다:

```typescript
// src/contracts/abis/types.ts
export interface LotteryContract {
  purchaseTicket: (lotteryId: bigint) => void;
  getParticipants: (lotteryId: bigint) => string[];
  drawWinner: (lotteryId: bigint) => string;
}
```

## Developer Portal API 연동

### 트랜잭션 상태 조회 API

결제(`pay`) 또는 트랜잭션(`sendTransaction`) 후에는 Developer Portal API로 상태를 확인해야 합니다.

```typescript
// 트랜잭션 상태 조회
// GET https://developer.worldcoin.org/api/v2/minikit/transaction/{transaction_id}

interface TransactionResponse {
  transactionId: string;
  transactionHash: string;
  transactionStatus: 'pending' | 'mined' | 'failed';
  miniappId: string;
  fromWalletAddress: string;
  updatedAt: string;
}

async function checkTransactionStatus(transactionId: string): Promise<TransactionResponse> {
  const response = await fetch(
    `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Transaction check failed: ${response.status}`);
  }

  return response.json();
}
```

### World ID 검증 API

World ID 검증은 `verifyCloudProof()` 함수를 사용합니다. **직접 구현하지 마세요.**

```typescript
// 백엔드에서 World ID 검증
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js';

async function verifyWorldIdProof(
  proof: string,
  merkle_root: string,
  nullifier_hash: string,
  verification_level: 'orb' | 'device'
): Promise<IVerifyResponse> {
  const verifyResponse = await verifyCloudProof(
    {
      proof,
      merkle_root,
      nullifier_hash,
      verification_level,
    },
    process.env.WORLD_APP_ID!,
    process.env.WORLD_ACTION_ID!
  );

  if (!verifyResponse.success) {
    throw new Error(`Verification failed: ${verifyResponse.detail}`);
  }

  return verifyResponse;
}
```

**주의사항:**
- `verifyCloudProof()`는 서버 사이드에서만 호출하세요
- 클라이언트에서 호출하면 API 키가 노출됩니다
- nullifier_hash를 저장하여 중복 인증을 방지하세요

### API 인증

Developer Portal API를 사용하려면 API 키가 필요합니다.

1. [Developer Portal](https://developer.worldcoin.org) 접속
2. 앱 선택 후 **API Keys** 탭으로 이동
3. **Create API Key** 클릭
4. 생성된 키를 `.env.local`에 저장

```bash
# API 키는 절대 프론트엔드에 노출하지 마세요
DEV_PORTAL_API_KEY=your_api_key_here
```

## 환경 변수 설정

### 필수 환경 변수

```env
# World App 설정
WORLD_APP_ID=app_xxx                    # Developer Portal에서 확인
NEXT_PUBLIC_WORLD_APP_ID=app_xxx        # 클라이언트에서도 필요

# World ID Action
WORLD_ACTION_ID=action_xxx              # 생성한 Action의 ID

# API 인증 (백엔드 전용)
DEV_PORTAL_API_KEY=xxx                  # Developer Portal API 키

# 개발 모드
NEXT_PUBLIC_MOCK_MODE=true              # Mock 모드 활성화 (개발용)
```

### .env.example 템플릿

프로젝트 루트에 `.env.example` 파일을 생성하여 팀원들이 필요한 환경 변수를 알 수 있게 하세요:

```env
# World App Configuration
WORLD_APP_ID=app_staging_xxx
NEXT_PUBLIC_WORLD_APP_ID=app_staging_xxx

# World ID Action
WORLD_ACTION_ID=action_xxx

# World Chain
NEXT_PUBLIC_WORLD_CHAIN_ID=4801
WORLD_CHAIN_RPC_URL=https://worldchain-sepolia.g.alchemy.com/public

# Developer Portal API (서버 전용)
DEV_PORTAL_API_KEY=

# Feature Flags
NEXT_PUBLIC_MOCK_MODE=true
```

## 문제 해결 (Troubleshooting)

| 문제 | 원인 | 해결 방법 |
|------|------|----------|
| 검증 항상 실패 | 잘못된 nonce | nonce 생성/저장 로직 확인, 서버에서 생성한 nonce 사용 |
| API 401 에러 | API 키 누락/만료 | Developer Portal에서 키 재발급, 환경 변수 확인 |
| API 403 에러 | 권한 부족 | API 키에 필요한 권한 추가 |
| ABI 타입 에러 | args 타입 불일치 | 모든 인자를 문자열로 변환 (`toString()`) |
| "Invalid proof" 에러 | Action ID 불일치 | WORLD_ACTION_ID 환경 변수 확인 |
| 트랜잭션 pending 지속 | 네트워크 지연 | 폴링으로 상태 재확인, 타임아웃 설정 |
| Mock이 동작 안 함 | MSW 미시작 | 개발 서버 시작 시 MSW 초기화 확인 |
| nullifier_hash 중복 | 동일 사용자 재인증 | DB에서 중복 확인 로직 추가 |

## 참고 자료

- [World Developer Portal](https://developer.worldcoin.org) - API 키 발급 및 앱 관리
- [World Official Docs - Verify](https://docs.world.org/mini-apps/commands/verify) - World ID 검증 가이드
- [World Official Docs - Wallet Auth](https://docs.world.org/mini-apps/commands/wallet-auth) - SIWE 인증 가이드
- [MSW 공식 문서](https://mswjs.io/) - Mock Service Worker 사용법
- [Wagmi CLI 문서](https://wagmi.sh/cli/getting-started) - ABI 타입 자동 생성
