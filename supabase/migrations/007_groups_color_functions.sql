-- ============================================
-- 007: 모임 색상(color)을 함수들에 반영
-- 006에서 groups.color 컬럼을 추가했지만, 색이 오갈 통로가 없어서
-- 저장도 조회도 안 된다. 두 함수를 고쳐 통로를 연결한다.
-- 사용법: Supabase 프로젝트 → SQL Editor → 통째로 붙여넣고 Run
--
-- ⚠️ drop이 먼저인 이유:
--   PostgreSQL은 create or replace로 "반환 타입"이나 "파라미터 개수"를 바꿀 수 없다.
--   - get_my_groups_summary: returns table에 color가 늘어남 → 반환 타입 변경
--   - create_group_with_owner: 파라미터가 2개 → 3개로 늘어남 (그냥 두면
--     옛 버전과 새 버전이 동시에 존재해 호출이 모호해진다)
--   그래서 지운 뒤 다시 만든다. drop하면 권한(grant)도 같이 사라지므로 아래에서 다시 부여한다.
-- ============================================


-- ---------- 1. 모임 생성: 색을 받아서 저장 ----------

drop function if exists public.create_group_with_owner(text, text);

create or replace function public.create_group_with_owner(
  _name  text,
  _type  text default 'friends',
  _color text default 'gray'      -- 앱이 팔레트에서 골라 넘긴다. 안 주면 '미지정'
)
returns groups
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid   uuid := auth.uid();
  _group groups;
begin
  -- 비로그인 요청 차단 (security definer라 이 검사가 꼭 필요)
  if _uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if _name is null or btrim(_name) = '' then
    raise exception 'group name required' using errcode = '22023';
  end if;

  -- 1) 모임 생성 (주인 = 호출한 사람)
  insert into groups (name, owner_id, type, color)
  values (btrim(_name), _uid, coalesce(_type, 'friends'), coalesce(_color, 'gray'))
  returning * into _group;

  -- 2) 만든 사람을 owner 멤버로 등록
  insert into group_members (group_id, user_id, role)
  values (_group.id, _uid, 'owner');

  return _group;
end;
$$;

revoke execute on function public.create_group_with_owner(text, text, text) from public, anon;
grant  execute on function public.create_group_with_owner(text, text, text) to authenticated;


-- ---------- 2. 모임 카드 집계: 색을 같이 돌려주기 ----------

drop function if exists public.get_my_groups_summary();

create or replace function public.get_my_groups_summary()
returns table (
  id             uuid,
  name           text,
  type           text,
  color          text,    -- ← 추가
  created_at     timestamptz,
  member_count   bigint,
  meetup_count   bigint,
  members        jsonb,   -- [{id, nickname, avatar_url}] (참여 순)
  current_meetup jsonb    -- {id,title,status,meet_date,place_count,confirmed_place} | null
)
language sql security definer set search_path = public stable as $$
  select
    g.id, g.name, g.type, g.color, g.created_at,
    (select count(*) from group_members gm where gm.group_id = g.id) as member_count,
    (select count(*) from meetups m where m.group_id = g.id)         as meetup_count,
    -- 멤버 아바타 목록 (참여 순)
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object('id', p.id, 'nickname', p.nickname, 'avatar_url', p.avatar_url)
          order by gm.joined_at
        ),
        '[]'::jsonb
      )
      from group_members gm
      join profiles p on p.id = gm.user_id
      where gm.group_id = g.id
    ) as members,
    -- 최근 약속 하나 (없으면 null) — 상태/날짜/후보수/확정장소까지 담아 프론트가 뱃지 계산
    (
      select jsonb_build_object(
        'id',        m.id,
        'title',     m.title,
        'status',    m.status,
        'meet_date', m.meet_date,
        'place_count',
          (select count(*) from places pl where pl.meetup_id = m.id),
        'confirmed_place',
          (select pl.name from places pl
           where pl.meetup_id = m.id and pl.is_confirmed
           order by pl.course_order asc limit 1)
      )
      from meetups m
      where m.group_id = g.id
      order by m.created_at desc
      limit 1
    ) as current_meetup
  from groups g
  where exists (
    select 1 from group_members gm
    where gm.group_id = g.id and gm.user_id = auth.uid()
  )
  order by g.created_at desc;
$$;


-- ---------- 3. 초대 코드 미리보기: 색을 같이 돌려주기 ----------
-- 초대 링크로 들어온 사람에게도 모임 카드를 색과 함께 보여주기 위해.
-- 여기도 returns table이 바뀌므로 drop이 먼저다.

drop function if exists public.get_group_by_invite_code(text);

create or replace function public.get_group_by_invite_code(_code text)
returns table (id uuid, name text, type text, color text, member_count bigint)
language sql security definer set search_path = public stable as $$
  select g.id, g.name, g.type, g.color,
    (select count(*) from group_members gm where gm.group_id = g.id) as member_count
  from groups g
  where g.invite_code = _code;
$$;
