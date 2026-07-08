<div align="center">

# 📍 Nodi

**친구들과 약속 장소를 함께 정하는 웹 서비스**

"여기 어때?" 하고 흩어지던 장소들을 한곳에 모아, 투표로 정하고, 카톡으로 공유하세요.

`node + 어디` · 하나의 노드에서 사람과 장소가 만난다

</div>

---

## 🧩 이런 문제를 풀어요

약속을 잡을 때 보통 이런 과정을 거칩니다.

> 네이버 지도에서 장소 찾기 → 링크 복사 → 카톡으로 전송

그런데 카톡은 여러 대화가 섞여서, 나중에 **"우리 어디 가기로 했지?"** 를 다시 찾기 어렵습니다.

Nodi는 **장소를 찾고, 모으고, 함께 정하는 과정**만 담당합니다. 대화는 그대로 카톡에서 하되, 장소와 결정은 Nodi에서 안 흩어지게 관리합니다.

## ✨ 주요 기능 (v1)

- **모임** — 친구 그룹 단위의 지속되는 공간. 멤버는 한 번만 초대하면 계속 재사용
- **약속** — 모임 안의 "어디 갈까" 라운드. 장소를 검색해 후보로 모음
- **투표** — 후보 장소에 투표해 의견 수렴 (실시간 반영)
- **코스 확정** — 한 곳이 아니라 밥→카페→술처럼 **여러 곳을 순서 있는 코스로** 확정
- **카톡 공유** — 링크로 공유하면 비회원도 열어서 투표 가능 (바이럴)
- **내 위치 기준 거리** — 후보마다 나에게서 얼마나 먼지 표시
- **알림 · 모임 기록** — 함께한 지 N일, 다녀온 곳 등 관계 기반 리텐션

## 🛠️ 기술 스택

| 구분 | 사용 | 선택 이유 |
|---|---|---|
| 프론트엔드 | Next.js (App Router) | 풀스택 + 배포 간편 |
| 백엔드/DB | Supabase (Postgres) | 서버 직접 구축 없이 DB·인증·실시간 |
| 인증 | Supabase Auth + 카카오 OAuth | 국내 사용자 친화 소셜 로그인 |
| 지도 | 네이버 지도 (Maps JS API) | 국내 장소 데이터 |
| 장소 검색 | 네이버 검색 API (지역) | 한국 장소 검색 |
| 배포 | Vercel | Next.js 최적 |
| 실시간 | Supabase Realtime | 투표·코스 라이브 업데이트 |

## 🗂️ 데이터 구조

```
모임(groups) → 약속(meetups) → 후보장소(places) → 투표(votes)
```

| 테이블 | 설명 |
|---|---|
| `profiles` | 사용자 (닉네임·프로필) |
| `groups` | 모임 (`type`: friends / couple / family) |
| `group_members` | 모임 참여자 |
| `meetups` | 약속 (한 번의 결정 라운드) |
| `places` | 후보 장소 (`is_confirmed`·`course_order`로 코스 표현) |
| `votes` | 투표 (한 사람이 한 장소에 한 표) |

전체 스키마와 RLS(접근 권한) 정책은 [`supabase/schema.sql`](./supabase/schema.sql) 참고.

## 🚀 시작하기

> ⚠️ 현재 개발 초기 단계입니다.

### 1. 설치
```bash
npm install
```

### 2. 환경 변수 (`.env.local`)
```env
# Supabase (Settings → API 에서 복사)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 네이버 지도 (네이버 클라우드 플랫폼)
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your-map-client-id

# 네이버 검색 API (developers.naver.com)
NAVER_SEARCH_CLIENT_ID=your-search-client-id
NAVER_SEARCH_CLIENT_SECRET=your-search-client-secret
```

### 3. Supabase 스키마 적용
Supabase 프로젝트 → SQL Editor → [`supabase/schema.sql`](./supabase/schema.sql) 붙여넣고 실행.

### 4. 개발 서버 실행
```bash
npm run dev
```
[http://localhost:3000](http://localhost:3000) 에서 확인.

## 🗺️ 로드맵

- **v1** — 모임 · 약속 보드 · 투표 · 코스 확정 · 카톡 공유
- **v2** — 커플 타입(D-day·데이트 지도) · 장소 팔로우 · 중간지점 찾기
- **v3** — 사람 팔로우 → 장소 소셜 네트워크

## 🎨 디자인

- **브랜드 컬러:** 딥그린 `#1D9E75`
- **로고:** 리플(중심점에서 퍼지는 동심원) — 여러 사람·장소가 한 점으로 모임
- **폰트:** Pretendard

---

<div align="center">
<sub>기획·설계 상세는 <a href="./plan.md">plan.md</a> 참고</sub>
</div>
