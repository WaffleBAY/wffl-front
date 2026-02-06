# Mini App 개발 환경 설정 가이드

> 마지막 업데이트: 2026-02-04
> 대상 독자: 전체 개발자

## 개요

이 문서는 World Mini App을 개발하기 위한 로컬 환경 설정 방법을 설명합니다. Mini App은 **World App 내부에서만 실행**되기 때문에 일반적인 웹 개발과 다른 설정이 필요합니다.

핵심 과제는 로컬에서 개발한 앱을 World App에서 테스트하는 것입니다. `localhost`는 World App에서 접근할 수 없으므로, **NGROK**을 사용해 로컬 서버를 인터넷에 노출해야 합니다.

## 사전 요구사항

개발을 시작하기 전에 다음 도구들이 설치되어 있어야 합니다:

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 18+ (권장: 20 LTS) | JavaScript 런타임 |
| pnpm | 8+ | 패키지 매니저 |
| World App | 최신 버전 | iOS/Android 테스트용 |
| NGROK | 최신 버전 | HTTPS 터널링 |

### Node.js 설치

```bash
# nvm 사용 시
nvm install 20
nvm use 20

# 버전 확인
node --version  # v20.x.x
```

### pnpm 설치

```bash
# npm으로 설치
npm install -g pnpm

# 또는 corepack 사용 (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate

# 버전 확인
pnpm --version  # 8.x.x
```

### World App 설치

- **iOS**: App Store에서 "World App" 검색
- **Android**: Google Play에서 "World App" 검색

테스트용 World ID가 필요하다면 [World App Simulator](https://docs.world.org/world-id/try) 페이지를 참고하세요.

## 프로젝트 설치

### 1. 저장소 클론

```bash
git clone <repository-url>
cd world-lottery
```

### 2. 의존성 설치

```bash
pnpm install
```

설치에 실패하면 다음을 확인하세요:
- Node.js 버전이 18 이상인지
- pnpm이 설치되어 있는지
- `.npmrc` 파일이 있다면 레지스트리 설정이 올바른지

### 3. 환경 변수 설정

```bash
# 템플릿 복사
cp .env.example .env.local

# 편집기에서 환경 변수 수정
code .env.local  # VS Code
# 또는
vim .env.local
```

필수 환경 변수는 [환경 변수 템플릿](#환경-변수-템플릿) 섹션을 참고하세요.

### 4. 개발 서버 시작

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 앱이 정상적으로 실행되는지 확인하세요.

## NGROK 터널링 설정

### NGROK이 필요한 이유

World App은 보안상 **HTTPS URL**만 허용합니다. 로컬 개발 서버(`http://localhost:3000`)는 World App에서 접근할 수 없습니다.

NGROK은 로컬 서버를 인터넷에 노출하는 터널을 생성합니다:

```
[Your Computer]         [NGROK]              [World App]
localhost:3000 <--> ngrok tunnel <--> https://xxx.ngrok-free.app
```

### 설치

#### macOS

```bash
# Homebrew 사용
brew install ngrok/ngrok/ngrok

# 또는 직접 다운로드
# https://ngrok.com/download
```

#### Windows

```bash
# Chocolatey 사용
choco install ngrok

# 또는 직접 다운로드
# https://ngrok.com/download 에서 ZIP 파일 다운로드 후 PATH에 추가
```

#### Linux

```bash
# APT (Debian/Ubuntu)
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok

# 또는 Snap
sudo snap install ngrok
```

### 인증 토큰 설정 (최초 1회)

NGROK을 사용하려면 무료 계정을 만들고 인증 토큰을 설정해야 합니다.

1. [NGROK 대시보드](https://dashboard.ngrok.com/get-started/your-authtoken)에 접속
2. 계정이 없다면 무료 가입 (GitHub/Google 로그인 가능)
3. **Your Authtoken** 페이지에서 토큰 복사
4. 터미널에서 토큰 등록:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

이 설정은 한 번만 하면 됩니다. 토큰은 `~/.ngrok2/ngrok.yml`에 저장됩니다.

### 터널 시작

두 개의 터미널 창이 필요합니다:

**터미널 1: 개발 서버**
```bash
pnpm dev
# 서버가 http://localhost:3000에서 실행됨
```

**터미널 2: NGROK 터널**
```bash
ngrok http 3000
```

실행하면 다음과 같은 출력이 나타납니다:

```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        Asia Pacific (ap)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
```

`https://abc123.ngrok-free.app` URL을 Developer Portal에 등록합니다.

**주의:** 무료 플랜에서는 NGROK을 재시작할 때마다 URL이 변경됩니다. 이를 피하려면 정적 도메인을 사용하세요.

### 정적 도메인 설정 (권장)

무료 플랜에서도 1개의 정적 도메인을 사용할 수 있습니다.

1. [NGROK 대시보드](https://dashboard.ngrok.com/cloud-edge/domains)에 접속
2. **New Domain** 클릭
3. 원하는 서브도메인 입력 (예: `my-lottery-app`)
4. 생성된 도메인으로 터널 시작:

```bash
ngrok http --domain=my-lottery-app.ngrok-free.app 3000
```

**장점:**
- URL이 항상 동일하므로 Developer Portal 업데이트 불필요
- 팀원과 동일한 URL 공유 가능
- QR 코드가 항상 동작

## Developer Portal 설정

### 1. 앱 등록/설정

1. [Developer Portal](https://developer.worldcoin.org)에 접속
2. GitHub 또는 이메일로 로그인
3. **Create App** 또는 기존 앱 선택
4. **Mini App Configuration** 섹션으로 이동

### 2. App URL 설정

Mini App이 실행될 URL을 설정합니다.

```
App URL: https://my-lottery-app.ngrok-free.app
```

**중요:**
- HTTPS만 허용됩니다 (`http://`는 안 됨)
- NGROK 정적 도메인을 사용하지 않으면 재시작마다 이 값을 업데이트해야 합니다
- URL 끝에 슬래시(`/`)를 붙이지 마세요

### 3. Incognito Action 생성

World ID 인증에 사용할 Action을 생성합니다.

1. **Incognito Actions** 탭 클릭
2. **Create Action** 버튼 클릭
3. 정보 입력:
   - **Name**: `buy-lottery-ticket` (팀 내부 식별용)
   - **Description**: 액션 설명 (선택사항)
   - **Max Verifications**: 제한 없음 또는 원하는 횟수
4. **Create** 클릭
5. 생성된 **Action ID** 복사 (예: `wid_staging_xxx`)
6. `.env.local`에 저장:

```env
WORLD_ACTION_ID=wid_staging_xxx
```

### 4. 컨트랙트 허용목록 설정

`sendTransaction`으로 호출할 컨트랙트는 반드시 허용목록에 추가해야 합니다.

1. **Configuration** > **Advanced** 섹션
2. **Allowed Contracts** 찾기
3. **Add Contract** 클릭
4. 컨트랙트 주소 입력 (예: `0x1234...`)
5. **Save** 클릭

**주의:**
- 허용목록에 없는 컨트랙트 호출은 실패합니다
- 에러 메시지: `"Contract not allowed"` 또는 무응답
- 테스트넷과 메인넷 컨트랙트 주소가 다르므로 둘 다 등록하세요

## 실기기 테스트

### 1. QR 코드로 앱 열기

Developer Portal에서 Mini App을 실기기에서 테스트할 수 있습니다.

1. Developer Portal에서 앱 선택
2. **Mini App** 섹션의 QR 코드 확인 (또는 **Test** 버튼)
3. World App 실행
4. **스캔** 탭에서 QR 코드 스캔
5. Mini App이 World App 내에서 열림

**QR 코드가 작동하지 않으면:**
- App URL이 올바른지 확인
- NGROK 터널이 실행 중인지 확인
- 개발 서버가 실행 중인지 확인

### 2. 딥 링크로 앱 열기 (대안)

QR 코드 대신 딥 링크를 사용할 수도 있습니다:

```
https://worldcoin.org/mini-app?app_id=app_xxx
```

이 링크를 모바일에서 열면 World App이 실행되면서 Mini App이 열립니다.

### 3. 디버깅 팁

#### Console 로그 확인

World App 내에서 실행되는 Mini App의 Console 로그는 직접 볼 수 없습니다. 대신:

1. **원격 디버깅** (iOS Safari):
   - Mac에서 Safari > 개발자 도구 > [iPhone 이름] > Mini App 선택
   - iPhone에서 설정 > Safari > 고급 > 웹 검사기 활성화 필요

2. **에러 로깅 서비스** 사용:
   - Sentry, LogRocket 등의 서비스로 프로덕션 에러 수집

3. **토스트 메시지로 디버깅**:
   ```typescript
   // 간단한 디버깅용
   toast(`Debug: ${JSON.stringify(data)}`);
   ```

#### Network 요청 확인

World App을 통한 API 요청을 확인하려면 프록시 도구를 사용하세요:

- **Charles Proxy** (유료, macOS/Windows)
- **Proxyman** (무료/유료, macOS)
- **mitmproxy** (무료, 커맨드라인)

설정 방법:
1. 프록시 도구 설치 및 실행
2. 모바일 기기와 같은 Wi-Fi 네트워크 연결
3. 모바일에서 프록시 설정 (컴퓨터 IP:포트)
4. HTTPS 인증서 설치 (도구별 문서 참고)

#### 일반적인 디버깅 워크플로우

```
1. 로컬에서 먼저 UI 확인 (http://localhost:3000)
   └─ MiniKit 명령어는 Mock 모드로 테스트

2. NGROK URL로 World App에서 테스트
   └─ 실제 MiniKit 명령어 테스트

3. 문제 발생 시:
   └─ console.log 추가
   └─ NGROK Web Interface (http://127.0.0.1:4040)에서 요청 확인
   └─ 수정 후 자동 리로드로 재테스트
```

## 환경 변수 템플릿

### .env.example

프로젝트에 포함된 `.env.example` 파일입니다. 이 파일을 `.env.local`로 복사하여 사용하세요.

```env
# =====================================================
# World App Configuration
# =====================================================
# Developer Portal에서 확인 (https://developer.worldcoin.org)
NEXT_PUBLIC_WORLD_APP_ID=app_staging_xxx
WORLD_APP_ID=app_staging_xxx

# =====================================================
# World ID Action
# =====================================================
# Developer Portal > Incognito Actions에서 생성
WORLD_ACTION_ID=action_xxx

# =====================================================
# World Chain Configuration
# =====================================================
# Sepolia Testnet (개발용)
NEXT_PUBLIC_WORLD_CHAIN_ID=4801
WORLD_CHAIN_RPC_URL=https://worldchain-sepolia.g.alchemy.com/public

# Mainnet (프로덕션용, 주석 해제하여 사용)
# NEXT_PUBLIC_WORLD_CHAIN_ID=480
# WORLD_CHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public

# =====================================================
# API Keys (서버 전용 - NEXT_PUBLIC 접두사 없음)
# =====================================================
# Developer Portal > API Keys에서 발급
DEV_PORTAL_API_KEY=

# =====================================================
# Feature Flags
# =====================================================
# true: Mock 데이터 사용 (로컬 개발)
# false: 실제 API 사용 (테스트/프로덕션)
NEXT_PUBLIC_MOCK_MODE=true

# =====================================================
# Optional: Database (필요한 경우)
# =====================================================
# DATABASE_URL=postgresql://user:password@localhost:5432/world_lottery

# =====================================================
# Optional: External Services
# =====================================================
# SENTRY_DSN=
# ANALYTICS_ID=
```

### 환경 변수 설명

| 변수 | 필수 | 클라이언트 노출 | 설명 |
|------|------|----------------|------|
| `NEXT_PUBLIC_WORLD_APP_ID` | O | O | Mini App 식별자 |
| `WORLD_APP_ID` | O | X | 서버에서 사용하는 App ID |
| `WORLD_ACTION_ID` | O | X | World ID 액션 식별자 |
| `NEXT_PUBLIC_WORLD_CHAIN_ID` | O | O | 체인 ID (4801: Sepolia, 480: Mainnet) |
| `WORLD_CHAIN_RPC_URL` | X | X | RPC 엔드포인트 (기본값 사용 가능) |
| `DEV_PORTAL_API_KEY` | O | X | Developer Portal API 키 |
| `NEXT_PUBLIC_MOCK_MODE` | X | O | Mock 모드 플래그 |

**주의:** `NEXT_PUBLIC_` 접두사가 있는 변수만 브라우저에서 접근 가능합니다. API 키는 절대 이 접두사를 사용하지 마세요.

## 문제 해결 (Troubleshooting)

| 문제 | 원인 | 해결 방법 |
|------|------|----------|
| QR 스캔 후 "앱을 찾을 수 없음" | App URL 불일치 | Developer Portal URL이 NGROK URL과 일치하는지 확인 |
| NGROK "Tunnel not found" | 터널 만료 또는 재시작됨 | `ngrok http 3000` 재실행 |
| NGROK 무료 한도 초과 | 무료 플랜 제한 | 유료 플랜 업그레이드 또는 다음 날 재시도 |
| Mini App 화면이 빈 화면 | JavaScript 에러 | 브라우저 Console 확인, localhost에서 먼저 테스트 |
| MiniKit 명령어 무반응 | World App 밖에서 실행 | 실기기 World App에서 테스트 |
| "Contract not allowed" 에러 | 허용목록 미설정 | Developer Portal에서 컨트랙트 주소 추가 |
| 환경 변수 인식 안 됨 | .env.local 미생성 | `cp .env.example .env.local` 실행 |
| 개발 서버 시작 안 됨 | 의존성 누락 | `pnpm install` 재실행 |
| "Invalid App ID" 에러 | 잘못된 App ID | Developer Portal에서 올바른 ID 복사 |
| HTTPS 인증서 오류 | NGROK 인증 미완료 | `ngrok config add-authtoken` 실행 |

## 개발 워크플로우 요약

매일 개발 시작 시:

```bash
# 1. 프로젝트 디렉토리로 이동
cd world-lottery

# 2. 개발 서버 시작 (터미널 1)
pnpm dev

# 3. NGROK 터널 시작 (터미널 2)
ngrok http --domain=my-lottery-app.ngrok-free.app 3000

# 4. (정적 도메인 미사용 시) Developer Portal URL 업데이트
# https://developer.worldcoin.org 접속 후 App URL 변경

# 5. World App에서 QR 스캔하여 테스트

# 6. 코드 수정 -> 자동 리로드 -> World App에서 확인
```

**팁:**
- VS Code의 터미널 분할 기능으로 두 터미널을 한 화면에서 관리
- 정적 도메인을 사용하면 4단계 생략 가능
- `NEXT_PUBLIC_MOCK_MODE=true`로 MiniKit 없이 로컬 UI 먼저 개발

## 참고 자료

- [NGROK 공식 문서](https://ngrok.com/docs) - 터널링 상세 설정
- [NGROK 대시보드](https://dashboard.ngrok.com) - 토큰 발급, 정적 도메인 관리
- [World Developer Portal](https://developer.worldcoin.org) - 앱 설정, API 키 발급
- [World Mini Apps 문서](https://docs.world.org/mini-apps) - 공식 개발 가이드
- [World Chain 네트워크 정보](https://docs.world.org/world-chain/quick-start/info) - 체인 설정
