-- ============================================
-- Nodi v1 스키마 + RLS  (모임별 계층 구조)
-- 계층: 모임(groups) → 약속(meetups) → 후보장소(places) → 투표(votes)
-- 사용법: Supabase 프로젝트 → SQL Editor → 통째로 붙여넣고 Run
-- ============================================

-- ---------- 1. 테이블 ----------

-- 사용자 프로필 (로그인은 Supabase auth가 담당, 여기엔 표시정보만)
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nickname   text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 모임 (지속되는 사람 그룹 = 카톡방 개념)
create table groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid not null references profiles(id) on delete cascade,
  type       text not null default 'friends',  -- 'friends'(v1) | 'couple'(v2) | 'family'
  created_at timestamptz default now()
);

-- 모임 참여자 (모임 <-> 사용자 다대다 연결)
create table group_members (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references groups(id) on delete cascade,
  user_id   uuid not null references profiles(id) on delete cascade,
  role      text not null default 'member',  -- 'owner' | 'member'
  joined_at timestamptz default now(),
  unique (group_id, user_id)                 -- 같은 모임에 중복 참여 방지
);

-- 약속 (모임 안의 "어디 갈까" 한 번의 결정 라운드)
-- 확정 결과는 한 곳이 아니라 "코스"(여러 장소) → places.is_confirmed / course_order로 표현
create table meetups (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups(id) on delete cascade,
  title       text not null,
  created_by  uuid not null references profiles(id) on delete cascade,
  status      text not null default 'voting',   -- 'voting' | 'confirmed'
  meet_date   date,                              -- 약속 날짜(선택)
  is_shared   boolean not null default false,    -- 링크 공유 여부
  share_token text unique default gen_random_uuid()::text,
  created_at  timestamptz default now()
);

-- 후보 장소 (약속에 담김) — 카테고리 구분 없이 다 담고, 확정 시 코스로 묶음
create table places (
  id             uuid primary key default gen_random_uuid(),
  meetup_id      uuid not null references meetups(id) on delete cascade,
  name           text not null,
  category       text,                              -- '밥' | '카페' | '술' | '놀거리' 등 (자유)
  address        text,
  lat            double precision,
  lng            double precision,
  naver_place_id text,
  added_by       uuid not null references profiles(id) on delete cascade,
  is_confirmed   boolean not null default false,    -- 확정 코스에 포함됐나
  course_order   int,                               -- 코스 내 순서 (1,2,3...) — is_confirmed일 때만 사용
  created_at     timestamptz default now()
);

-- 투표 (한 사람이 한 장소에 한 표)
create table votes (
  id         uuid primary key default gen_random_uuid(),
  place_id   uuid not null references places(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (place_id, user_id)                 -- 중복투표 방지
);

-- 조회 속도용 인덱스
create index on meetups(group_id);
create index on places(meetup_id);
create index on votes(place_id);
create index on group_members(group_id, user_id);


-- ---------- 2. 회원가입 시 프로필 자동 생성 ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', '사용자'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------- 3. 권한 확인 도우미 함수 ----------
-- (RLS 무한루프를 피하려고 security definer로 만듦)

-- 이 모임의 멤버인가?
create or replace function public.is_group_member(_group_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from group_members
    where group_id = _group_id and user_id = auth.uid()
  );
$$;

-- 이 모임의 주인인가?
create or replace function public.is_group_owner(_group_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from groups
    where id = _group_id and owner_id = auth.uid()
  );
$$;

-- 이 약속을 볼 수 있나? (모임 멤버이거나, 공유된 약속이면 OK)
create or replace function public.can_view_meetup(_meetup_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from meetups m
    where m.id = _meetup_id
      and ( m.is_shared
            or exists (select 1 from group_members gm
                       where gm.group_id = m.group_id and gm.user_id = auth.uid()) )
  );
$$;

-- 이 약속이 속한 모임의 멤버인가? (장소·투표 추가 권한 확인용)
create or replace function public.is_meetup_member(_meetup_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from meetups m
    join group_members gm on gm.group_id = m.group_id
    where m.id = _meetup_id and gm.user_id = auth.uid()
  );
$$;

-- 이 약속이 속한 모임의 주인인가?
create or replace function public.is_meetup_group_owner(_meetup_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from meetups m
    join groups g on g.id = m.group_id
    where m.id = _meetup_id and g.owner_id = auth.uid()
  );
$$;


-- ---------- 4. RLS 켜기 ----------

alter table profiles      enable row level security;
alter table groups        enable row level security;
alter table group_members enable row level security;
alter table meetups       enable row level security;
alter table places        enable row level security;
alter table votes         enable row level security;


-- ---------- 5. 정책 ----------

-- profiles: 프로필은 공개 조회, 수정은 본인만
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- groups: 멤버만 조회 / 생성은 본인이 owner / 수정·삭제는 주인만
create policy "groups_select" on groups for select using (is_group_member(id));
create policy "groups_insert" on groups for insert with check (owner_id = auth.uid());
create policy "groups_update" on groups for update using (owner_id = auth.uid());
create policy "groups_delete" on groups for delete using (owner_id = auth.uid());

-- group_members: 같은 모임 멤버 조회 / 내가 참여 or 주인이 초대 / 나가기·주인 강퇴
create policy "gmembers_select" on group_members for select using (is_group_member(group_id));
create policy "gmembers_insert" on group_members for insert
  with check (user_id = auth.uid() or is_group_owner(group_id));
create policy "gmembers_delete" on group_members for delete
  using (user_id = auth.uid() or is_group_owner(group_id));

-- meetups: 볼 수 있는 약속만 조회 / 모임 멤버가 생성(본인) / 만든 본인 or 모임주인만 수정·삭제
create policy "meetups_select" on meetups for select using (can_view_meetup(id));
create policy "meetups_insert" on meetups for insert
  with check (is_group_member(group_id) and created_by = auth.uid());
create policy "meetups_update" on meetups for update
  using (created_by = auth.uid() or is_group_owner(group_id));
create policy "meetups_delete" on meetups for delete
  using (created_by = auth.uid() or is_group_owner(group_id));

-- places: 볼 수 있는 약속이면 조회 / 모임 멤버만 추가(본인 이름으로) / 추가한 본인 or 모임주인만 수정·삭제
create policy "places_select" on places for select using (can_view_meetup(meetup_id));
create policy "places_insert" on places for insert
  with check (is_meetup_member(meetup_id) and added_by = auth.uid());
create policy "places_update" on places for update
  using (added_by = auth.uid() or is_meetup_group_owner(meetup_id));
create policy "places_delete" on places for delete
  using (added_by = auth.uid() or is_meetup_group_owner(meetup_id));

-- votes: 볼 수 있는 약속이면 조회 / 모임 멤버만 본인 이름으로 투표 / 내 표만 취소
create policy "votes_select" on votes for select
  using (exists (select 1 from places p where p.id = place_id and can_view_meetup(p.meetup_id)));
create policy "votes_insert" on votes for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from places p where p.id = place_id and is_meetup_member(p.meetup_id))
  );
create policy "votes_delete" on votes for delete using (user_id = auth.uid());


-- ---------- 6. 실시간 반영 켜기 (약속·장소·투표 라이브 업데이트) ----------

alter publication supabase_realtime add table meetups;
alter publication supabase_realtime add table places;
alter publication supabase_realtime add table votes;
