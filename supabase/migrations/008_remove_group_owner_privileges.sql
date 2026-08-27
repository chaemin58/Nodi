-- ============================================
-- 008: 모임 "주인(owner)" 권한 개념 제거
--
-- 카톡 단톡방처럼 방장 없는 모델로 바꾼다.
--   - 모임 정보는 멤버 누구나 수정
--   - 모임 삭제는 없음 (나가기만. 카톡에 방 삭제가 없는 것과 같다)
--   - 강퇴 없음 (본인만 나갈 수 있다)
--   - 약속은 멤버 누구나 수정, 만든 사람만 삭제
--
-- owner_id 컬럼 자체는 남긴다. 이제 "권한"이 아니라 "누가 만들었는지 기록"이다.
-- (meetups.created_by 와 같은 성격. 나중에 이름을 바꿔도 좋다.)
--
-- 사용법: Supabase 프로젝트 → SQL Editor → 통째로 붙여넣고 Run
-- ============================================


-- ---------- groups ----------

-- 조회: 멤버만. (owner_id 조건은 004에서 "생성 직후 되돌려받기"용으로 넣었는데,
--       지금은 create_group_with_owner가 security definer라 RLS를 안 거치므로 불필요.)
alter policy "groups_select" on groups
  using (is_group_member(id));

-- 수정: 멤버 누구나. 이름·색·한 줄 메시지 전부 해당.
alter policy "groups_update" on groups
  using (is_group_member(id));

-- 삭제: 없앤다. 모임을 지우는 대신 나가기만 한다.
-- ⚠️ 정책이 없으면 아무도 삭제할 수 없다(RLS가 막는다). 관리자는 SQL Editor로 가능.
drop policy if exists "groups_delete" on groups;


-- ---------- group_members ----------

-- 참여: 본인만. 초대 링크를 받은 사람이 스스로 들어온다.
alter policy "gmembers_insert" on group_members
  with check (user_id = auth.uid());

-- 나가기: 본인만. 강퇴 없음.
alter policy "gmembers_delete" on group_members
  using (user_id = auth.uid());


-- ---------- meetups ----------

-- 수정: 멤버 누구나. ("얘들아 이거 날짜 바꾸자")
alter policy "meetups_update" on meetups
  using (is_group_member(group_id));

-- 삭제: 만든 사람만. 남이 만든 약속을 함부로 지우지 못하게.
alter policy "meetups_delete" on meetups
  using (created_by = auth.uid());


-- ---------- places ----------
-- 약속과 같은 원칙을 적용한다. (수정은 누구나, 삭제는 추가한 사람만)

alter policy "places_update" on places
  using (is_meetup_member(meetup_id));

alter policy "places_delete" on places
  using (added_by = auth.uid());


-- 참고: 이 마이그레이션 이후 is_group_owner() / is_meetup_group_owner() 는
-- 어떤 정책에서도 쓰이지 않는다. 당장 지우지는 않는다 — 되돌릴 여지를 남긴다.
