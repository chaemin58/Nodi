// 모임(groups) 데이터 접근
// RLS: groups_select = is_group_member(id) → 조회는 자동으로 "내 모임"만 나온다.
import type { DbClient } from "@/utils/supabase/types";
import type { Tables } from "@/types/database";
import type { GroupType, MeetupStatus } from "@/types";
import { requireUserId } from "./auth";

export type GroupRow = Tables<"groups">;

/** 내가 속한 모임 목록 (최신순) */
export async function getMyGroups(supabase: DbClient): Promise<GroupRow[]> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export type GroupMemberPreview = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
};

/** 모임 카드에 뜨는 "최근 약속" 요약 — 뱃지/후보수/확정장소는 프론트가 이걸로 계산 */
export type CurrentMeetupSummary = {
  id: string;
  title: string;
  status: MeetupStatus;
  meetDate: string | null;
  placeCount: number;
  confirmedPlace: string | null;
};

/** my-nodi 카드 한 장에 필요한 모임 집계 데이터 */
export type GroupSummary = {
  id: string;
  name: string;
  type: GroupType;
  createdAt: string;
  memberCount: number;
  meetupCount: number;
  members: GroupMemberPreview[];
  currentMeetup: CurrentMeetupSummary | null;
};

/**
 * 내 모임 목록 + 카드용 집계 (최신순).
 * get_my_groups_summary RPC 한 번으로 멤버수·아바타·약속수·최근약속을 모두 가져온다.
 */
export async function getMyGroupsSummary(supabase: DbClient): Promise<GroupSummary[]> {
  const { data, error } = await supabase.rpc("get_my_groups_summary");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as GroupType,
    createdAt: row.created_at,
    memberCount: Number(row.member_count),
    meetupCount: Number(row.meetup_count),
    members: (row.members ?? []).map((m) => ({
      id: m.id,
      nickname: m.nickname,
      avatarUrl: m.avatar_url,
    })),
    currentMeetup: row.current_meetup
      ? {
          id: row.current_meetup.id,
          title: row.current_meetup.title,
          status: row.current_meetup.status as MeetupStatus,
          meetDate: row.current_meetup.meet_date,
          placeCount: Number(row.current_meetup.place_count),
          confirmedPlace: row.current_meetup.confirmed_place,
        }
      : null,
  }));
}

/** 모임 하나 */
export async function getGroup(supabase: DbClient, groupId: string): Promise<GroupRow | null> {
  const { data, error } = await supabase.from("groups").select("*").eq("id", groupId).maybeSingle();
  if (error) throw error;
  return data;
}

// 모임 생성은 여기 없다.
// DB 함수 create_group_with_owner(모임 생성 + owner 멤버 등록을 원자적으로 처리)를
// POST /api/groups 라우트에서 호출한다. 앱에서 두 번 insert 하면 RLS에 막힌다.

/** 모임 이름 변경 (주인만 — RLS가 강제) */
export async function renameGroup(
  supabase: DbClient,
  groupId: string,
  name: string,
): Promise<void> {
  const { error } = await supabase.from("groups").update({ name }).eq("id", groupId);
  if (error) throw error;
}

/** 모임 삭제 (주인만 — RLS가 강제) */
export async function deleteGroup(supabase: DbClient, groupId: string): Promise<void> {
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) throw error;
}

/** 모임 멤버 목록 (프로필 조인) */
export async function getGroupMembers(supabase: DbClient, groupId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select("id, role, joined_at, user_id, profiles(id, nickname, avatar_url)")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return data;
}

/** 내가 이 모임에 참여 (초대 링크 수락 등) */
export async function joinGroup(supabase: DbClient, groupId: string): Promise<void> {
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId, role: "member" });
  if (error) throw error;
}

/** 모임 나가기 (내 멤버십 삭제) */
export async function leaveGroup(supabase: DbClient, groupId: string): Promise<void> {
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

export type GroupInvitePreview = {
  id: string;
  name: string;
  type: GroupType;
  memberCount: number;
};

/**
 * 초대 코드로 모임 미리보기 (멤버가 아니어도 조회 가능).
 * get_group_by_invite_code RPC(security definer)를 거치므로
 * groups_select RLS(멤버만 조회)와 무관하게 동작함.
 */
export async function getGroupByInviteCode(
  supabase: DbClient,
  code: string,
): Promise<GroupInvitePreview | null> {
  const { data, error } = await supabase.rpc("get_group_by_invite_code", {
    _code: code,
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    type: row.type as GroupType,
    memberCount: Number(row.member_count),
  };
}

/** 초대 코드로 모임 참여. 코드가 유효하지 않으면 에러. */
export async function joinGroupByInviteCode(
  supabase: DbClient,
  code: string,
): Promise<string> {
  const preview = await getGroupByInviteCode(supabase, code);
  if (!preview) throw new Error("유효하지 않은 초대 코드입니다.");
  await joinGroup(supabase, preview.id);
  return preview.id;
}

/** 초대 코드 재발급 (기존 링크 무효화 — 주인만, RLS가 강제) */
export async function regenerateInviteCode(
  supabase: DbClient,
  groupId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("groups")
    .update({ invite_code: crypto.randomUUID() })
    .eq("id", groupId)
    .select("invite_code")
    .single();
  if (error) throw error;
  return data.invite_code;
}
