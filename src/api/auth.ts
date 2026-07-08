import type { DbClient } from "@/utils/supabase/types";

/** 현재 로그인한 사용자 id. 없으면 에러 (로그인 필요한 작업에서 사용). */
export async function requireUserId(supabase: DbClient): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("로그인이 필요합니다.");
  }
  return user.id;
}

/** 현재 사용자 id. 비로그인이면 null (비회원 공유 뷰 등에서 사용). */
export async function getUserId(supabase: DbClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
