-- 모임 생성을 DB 함수 하나로 처리한다.
--
-- 왜: 기존엔 앱에서 groups → group_members 두 번 insert 했는데,
--     각 단계가 RLS 정책에 걸릴 수 있어 취약했다. 특히 "첫 멤버 등록"은
--     정책에 따라 닭-달걀 문제(멤버여야 멤버가 될 수 있음)가 생긴다.
--
-- 해결: security definer 함수로 두 insert를 한 번에(원자적으로) 수행한다.
--       함수 소유자 권한으로 실행되므로 RLS를 통과하고,
--       auth.uid()는 여전히 "호출한 사용자"라 남의 명의로는 못 만든다.
--       중간 실패 시 트랜잭션이 통째로 롤백되어 유령 모임도 안 생긴다.
create or replace function public.create_group_with_owner(
  _name text,
  _type text default 'friends'
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
  insert into groups (name, owner_id, type)
  values (btrim(_name), _uid, coalesce(_type, 'friends'))
  returning * into _group;

  -- 2) 만든 사람을 owner 멤버로 등록
  insert into group_members (group_id, user_id, role)
  values (_group.id, _uid, 'owner');

  return _group;
end;
$$;

-- 로그인한 사용자만 호출 가능
revoke execute on function public.create_group_with_owner(text, text) from public, anon;
grant  execute on function public.create_group_with_owner(text, text) to authenticated;
