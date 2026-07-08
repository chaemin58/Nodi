// 모임(groups) 데이터 접근
// RLS: groups_select = is_group_member(id) → 조회는 자동으로 "내 모임"만 나온다.
import type { DbClient } from "@/utils/supabase/types";
import type { Tables } from "@/types/database";
import type { GroupType } from "@/types";
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

/** 모임 하나 */
export async function getGroup(
  supabase: DbClient,
  groupId: string
): Promise<GroupRow | null> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * 모임 생성 + 생성자를 owner 멤버로 등록.
 * groups_insert(owner_id=auth.uid) → group_members(owner) 두 단계.
 */
export async function createGroup(
  supabase: DbClient,
  input: { name: string; type?: GroupType }
): Promise<GroupRow> {
  const userId = await requireUserId(supabase);

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name: input.name, type: input.type ?? "friends", owner_id: userId })
    .select("*")
    .single();
  if (error) throw error;

  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: userId, role: "owner" });
  if (memberError) throw memberError;

  return group;
}

/** 모임 이름 변경 (주인만 — RLS가 강제) */
export async function renameGroup(
  supabase: DbClient,
  groupId: string,
  name: string
): Promise<void> {
  const { error } = await supabase
    .from("groups")
    .update({ name })
    .eq("id", groupId);
  if (error) throw error;
}

/** 모임 삭제 (주인만 — RLS가 강제) */
export async function deleteGroup(
  supabase: DbClient,
  groupId: string
): Promise<void> {
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
export async function joinGroup(
  supabase: DbClient,
  groupId: string
): Promise<void> {
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId, role: "member" });
  if (error) throw error;
}

/** 모임 나가기 (내 멤버십 삭제) */
export async function leaveGroup(
  supabase: DbClient,
  groupId: string
): Promise<void> {
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}
