# World Chain Testnet 가이드

> 마지막 업데이트: 2026-02-04
> 대상 독자: 전체 개발자

## 개요

World Chain은 Worldcoin에서 운영하는 L2(Layer 2) 블록체인입니다. Optimism의 OP Stack을 기반으로 하며, World ID 인증 사용자에게 가스비 없이 트랜잭션을 수행할 수 있는 Priority Blockspace를 제공합니다.

### 테스트넷의 목적

- **개발 및 테스트**: 메인넷 배포 전 스마트 컨트랙트 및 Mini App 테스트
- **무료 토큰 사용**: Faucet에서 테스트용 ETH를 무료로 받아 사용
- **안전한 실험**: 실제 자산 위험 없이 기능 검증

### 테스트넷 vs 메인넷

| 구분 | 테스트넷 (Sepolia) | 메인넷 |
|------|-------------------|--------|
| Chain ID | **4801** | **480** |
| 용도 | 개발/테스트 | 실제 서비스 |
| 토큰 가치 | 없음 (테스트용) | 실제 가치 |
| Faucet | 사용 가능 | 해당 없음 |

---

## 네트워크 정보

### World Chain Sepolia (테스트넷)

| 항목 | 값 |
|------|-----|
| **Chain ID** | `4801` |
| 네트워크 이름 | World Chain Sepolia |
| RPC URL (HTTP) | `https://worldchain-sepolia.g.alchemy.com/public` |
| RPC URL (WebSocket) | `wss://worldchain-sepolia.g.alchemy.com/public` |
| Block Explorer | https://sepolia.worldscan.org |
| 네이티브 토큰 | ETH (테스트용) |
| Bridge | https://worldchain-sepolia.bridge.alchemy.com |

### World Chain Mainnet (메인넷)

| 항목 | 값 |
|------|-----|
| **Chain ID** | `480` |
| 네트워크 이름 | World Chain |
| RPC URL (HTTP) | `https://worldchain-mainnet.g.alchemy.com/public` |
| Block Explorer | https://worldscan.org |
| 네이티브 토큰 | ETH |

**주의**: 테스트넷은 Chain ID `4801`, 메인넷은 `480`입니다. 혼동하지 않도록 주의하세요.

---

## 지갑에 네트워크 추가하기

### MetaMask에서 추가

1. MetaMask 열기 > 네트워크 드롭다운 클릭
2. "네트워크 추가" 클릭
3. "네트워크 수동 추가" 선택
4. 다음 정보 입력:

   | 필드 | 값 |
   |------|-----|
   | 네트워크 이름 | World Chain Sepolia |
   | RPC URL | https://worldchain-sepolia.g.alchemy.com/public |
   | 체인 ID | 4801 |
   | 통화 기호 | ETH |
   | 블록 탐색기 URL | https://sepolia.worldscan.org |

5. "저장" 클릭

### ChainList에서 자동 추가

1. https://chainlist.org/chain/4801 접속
2. "Add to MetaMask" 클릭
3. MetaMask에서 네트워크 추가 승인

### Viem/Wagmi 설정 코드

```typescript
// lib/chains/world-chain.ts
import { defineChain } from 'viem';

// World Chain Sepolia (테스트넷)
export const worldChainSepolia = defineChain({
  id: 4801, // 중요: 메인넷은 480
  name: 'World Chain Sepolia',
  network: 'world-chain-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
      webSocket: ['wss://worldchain-sepolia.g.alchemy.com/public'],
    },
    alchemy: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WorldScan',
      url: 'https://sepolia.worldscan.org',
    },
  },
  testnet: true,
});

// World Chain Mainnet (메인넷)
export const worldChainMainnet = defineChain({
  id: 480,
  name: 'World Chain',
  network: 'world-chain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-mainnet.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WorldScan',
      url: 'https://worldscan.org',
    },
  },
});
```

```typescript
// Wagmi 설정에 체인 추가
import { createConfig, http } from 'wagmi';
import { worldChainSepolia, worldChainMainnet } from './lib/chains/world-chain';

export const config = createConfig({
  chains: [worldChainSepolia, worldChainMainnet],
  transports: {
    [worldChainSepolia.id]: http(),
    [worldChainMainnet.id]: http(),
  },
});
```

---

## L2 Faucet 받는 법

테스트넷에서 트랜잭션을 수행하려면 가스비로 사용할 테스트용 ETH가 필요합니다. 다음 Faucet에서 무료로 받을 수 있습니다.

### 방법 1: Alchemy Faucet (추천)

가장 빠르고 간편한 방법입니다.

1. https://www.alchemy.com/faucets/world-chain-sepolia 접속
2. Alchemy 계정 로그인 (무료 계정 생성 가능)
3. 지갑 주소 입력 (예: 0x1234...)
4. "Send Me ETH" 클릭
5. 몇 초 후 테스트 ETH 수령 완료

**특징:**
- 일일 제한: 0.1 ETH
- 인증: Alchemy 계정 필요
- 속도: 빠름 (수 초)

### 방법 2: Chainlink Faucet

1. https://faucets.chain.link/ 접속
2. 네트워크 선택: "World Chain Sepolia"
3. GitHub 또는 Twitter 계정으로 인증
4. 지갑 주소 입력
5. "Send" 클릭

**특징:**
- 일일 제한: 0.1 ETH
- 인증: GitHub 또는 Twitter 계정 필요
- 속도: 보통 (1-2분)

### 방법 3: ETHGlobal Faucet

ETHGlobal 해커톤 참가자에게 제공되는 Faucet입니다.

1. ETHGlobal 해커톤 참가 확인
2. 해커톤 Discord에서 Faucet 채널 접근
3. 지갑 주소 공유하여 ETH 요청

**특징:**
- 제한: 해커톤 참가자만 가능
- 양: 일반 Faucet보다 많은 양 제공

### Faucet 사용 시 주의사항

- **일일 제한량**: 대부분 하루에 0.1-0.5 ETH로 제한됩니다.
- **재요청 대기**: 같은 주소로 재요청 시 24시간 대기가 필요할 수 있습니다.
- **지갑 주소 확인**: 복사-붙여넣기 시 정확한 주소인지 확인하세요.
- **네트워크 확인**: World Chain Sepolia (4801) 네트워크용 Faucet인지 확인하세요.

---

## Block Explorer 사용법

Block Explorer를 통해 트랜잭션, 컨트랙트, 토큰 잔액 등을 확인할 수 있습니다.

### 테스트넷 Explorer
- URL: https://sepolia.worldscan.org

### 메인넷 Explorer
- URL: https://worldscan.org

### 트랜잭션 조회

1. Explorer 접속
2. 검색창에 트랜잭션 해시 입력 (예: 0xabc123...)
3. 다음 정보 확인 가능:
   - 트랜잭션 상태 (성공/실패)
   - From/To 주소
   - 전송된 값 (ETH)
   - 가스 사용량
   - 입력 데이터 (컨트랙트 호출 시)

### 컨트랙트 검증

소스 코드 검증을 통해 컨트랙트 투명성을 높일 수 있습니다.

1. 컨트랙트 주소 페이지 접속
2. "Contract" 탭 클릭
3. "Verify and Publish" 클릭
4. 컴파일러 버전, 소스 코드 입력
5. 검증 완료 후 "Read Contract", "Write Contract" 탭 활성화

### 토큰 잔액 확인

1. 지갑 주소 검색
2. "Tokens" 탭에서 보유 토큰 목록 확인
3. 각 토큰별 잔액 및 트랜잭션 내역 확인

---

## 환경 변수 설정

프로젝트에서 World Chain을 사용하기 위한 환경 변수 설정입니다.

```bash
# .env.local

# World Chain RPC (테스트넷)
NEXT_PUBLIC_WORLD_CHAIN_RPC_URL=https://worldchain-sepolia.g.alchemy.com/public
NEXT_PUBLIC_WORLD_CHAIN_ID=4801

# World Chain RPC (메인넷) - 프로덕션 배포 시
# NEXT_PUBLIC_WORLD_CHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
# NEXT_PUBLIC_WORLD_CHAIN_ID=480

# Block Explorer
NEXT_PUBLIC_WORLD_EXPLORER_URL=https://sepolia.worldscan.org
```

---

## 문제 해결 (Troubleshooting)

| 문제 | 원인 | 해결 방법 |
|------|------|----------|
| Chain ID 불일치 오류 | 480 vs 4801 혼동 | 테스트넷은 `4801`, 메인넷은 `480` 확인 |
| "insufficient funds" 에러 | Faucet 미사용 또는 잔액 부족 | Faucet에서 테스트 ETH 수령 |
| RPC 연결 실패 | URL 오타 또는 네트워크 문제 | 공식 RPC URL 복사-붙여넣기, VPN 확인 |
| 트랜잭션 pending 상태 유지 | 가스 가격 너무 낮음 | 기본 가스 설정 사용 또는 가스 증가 |
| Explorer에서 트랜잭션 안 보임 | 네트워크 불일치 | 올바른 Explorer (testnet/mainnet) 확인 |
| MetaMask에서 네트워크 추가 실패 | 잘못된 설정 값 | Chain ID, RPC URL 재확인 |
| Faucet에서 요청 거부 | 일일 제한 도달 | 24시간 후 재시도 또는 다른 Faucet 사용 |

---

## 참고 자료

### 공식 문서
- [World Chain 공식 문서](https://docs.world.org/world-chain/quick-start/info) - 네트워크 정보
- [World Chain Developer Docs](https://docs.world.org/world-chain) - 개발자 가이드

### Faucet
- [Alchemy World Chain Sepolia Faucet](https://www.alchemy.com/faucets/world-chain-sepolia) - 추천
- [Chainlink Faucets](https://faucets.chain.link/) - 여러 네트워크 지원

### Block Explorer
- [WorldScan (Testnet)](https://sepolia.worldscan.org) - 테스트넷 탐색기
- [WorldScan (Mainnet)](https://worldscan.org) - 메인넷 탐색기

### 도구
- [ChainList](https://chainlist.org/chain/4801) - 네트워크 자동 추가
- [World Chain Bridge](https://worldchain-sepolia.bridge.alchemy.com) - 테스트넷 브릿지
