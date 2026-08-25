-- 모임 생성 버그 수정.
--
-- 증상: createGroup()이 groups insert 직후 .select().single()로 방금 만든 행을
--       되받는데, groups_select 정책이 is_group_member(id) 라서 "아직 멤버 등록 전"
--       인 그 순간엔 0행이 반환되고 .single()이 에러(PGRST116)를 던져 500이 났다.
--       (모임은 만들어지지만 멤버 등록 전에 터져 멤버 없는 유령 모임이 남았다.)
--
-- 해결: 주인은 멤버 여부와 무관하게 자기 모임을 항상 볼 수 있어야 한다.
--       SELECT 정책에 owner_id = auth.uid() 를 OR로 추가한다.
alter policy "groups_select" on groups
  using (is_group_member(id) or owner_id = auth.uid());
