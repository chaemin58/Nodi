// 프로필(profiles) 데이터 접근
// 로그인은 Supabase auth가 담당하고, 여기 profiles 테이블엔 표시정보(닉네임·아바타)만 둔다.
// 행 자체는 회원가입 시 handle_new_user() 트리거가 자동 생성한다(schema.sql 참고).
import type { DbClient } from "@/utils/supabase/types";
import type { Tables } from "@/types/database";
import { requireUserId } from "./auth";

export type ProfileRow = Tables<"profiles">;

/** 현재 로그인한 사용자의 프로필 (없으면 null — 트리거 지연 등 예외 상황) */
export async function getMyProfile(supabase: DbClient): Promise<ProfileRow | null> {
  const userId = await requireUserId(supabase);
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** 특정 사용자의 프로필 (profiles_select RLS = 공개 조회) */
export async function getProfile(supabase: DbClient, userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** 여러 사용자의 프로필 한 번에 (아바타 그룹 등에서 id 목록으로 조회) */
export async function getProfilesByIds(
  supabase: DbClient,
  userIds: string[],
): Promise<ProfileRow[]> {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase.from("profiles").select("*").in("id", userIds);
  if (error) throw error;
  return data;
}

/** 내 프로필 수정 (닉네임·아바타 — profiles_update RLS = 본인만) */
export async function updateMyProfile(
  supabase: DbClient,
  input: { nickname?: string; avatarUrl?: string | null },
): Promise<ProfileRow> {
  const userId = await requireUserId(supabase);
  const patch: { nickname?: string; avatar_url?: string | null } = {};
  if (input.nickname !== undefined) patch.nickname = input.nickname;
  if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
