-- ============================================
-- 002: 모임 초대 코드 추가
-- 이미 schema.sql을 실행한 기존 프로젝트에 적용하는 추가 마이그레이션.
-- 사용법: Supabase 프로젝트 → SQL Editor → 통째로 붙여넣고 Run
-- ============================================

alter table groups
  add column invite_code text unique not null default gen_random_uuid()::text;

-- 초대 코드로 모임 미리보기 (멤버가 아니어도 호출 가능 — groups_select RLS는 안 거침.
-- security definer라 코드가 정확히 일치하는 한 행만 돌려주므로 전체 목록 유출 위험 없음)
create or replace function public.get_group_by_invite_code(_code text)
returns table (id uuid, name text, type text, member_count bigint)
language sql security definer set search_path = public stable as $$
  select g.id, g.name, g.type,
    (select count(*) from group_members gm where gm.group_id = g.id) as member_count
  from groups g
  where g.invite_code = _code;
$$;
