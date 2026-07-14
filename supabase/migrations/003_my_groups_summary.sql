-- ============================================
-- 003: 모임 카드용 집계 함수 (get_my_groups_summary)
-- my-nodi 페이지 카드 한 장에 필요한 정보를 한 번의 호출로 반환한다.
--   - 멤버 수 / 멤버 아바타 목록
--   - 약속(meetup) 개수
--   - "최근 약속" 요약 (뱃지·후보수·확정장소는 이걸로 프론트가 계산)
-- security definer + auth.uid() 필터 → 내가 속한 모임만 (RLS 재귀 회피, is_group_member와 같은 패턴)
-- 사용법: Supabase 프로젝트 → SQL Editor → 통째로 붙여넣고 Run
-- ============================================

create or replace function public.get_my_groups_summary()
returns table (
  id             uuid,
  name           text,
  type           text,
  created_at     timestamptz,
  member_count   bigint,
  meetup_count   bigint,
  members        jsonb,   -- [{id, nickname, avatar_url}] (참여 순)
  current_meetup jsonb    -- {id,title,status,meet_date,place_count,confirmed_place} | null
)
language sql security definer set search_path = public stable as $$
  select
    g.id, g.name, g.type, g.created_at,
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
