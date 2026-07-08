// 투표(votes) 데이터 접근 — 한 사람이 한 장소에 한 표 (unique 제약).
import type { DbClient } from "@/utils/supabase/types";
import type { Tables } from "@/types/database";
import { requireUserId } from "./auth";

export type VoteRow = Tables<"votes">;

/** 한 약속의 모든 투표 (places 조인으로 meetup 범위 필터) */
export async function getVotesByMeetup(
  supabase: DbClient,
  meetupId: string
): Promise<VoteRow[]> {
  const { data, error } = await supabase
    .from("votes")
    .select("id, place_id, user_id, created_at, places!inner(meetup_id)")
    .eq("places.meetup_id", meetupId);
  if (error) throw error;
  // 조인 컬럼(places) 제거하고 VoteRow 형태만 반환
  return (data ?? []).map(({ id, place_id, user_id, created_at }) => ({
    id,
    place_id,
    user_id,
    created_at,
  }));
}

/** 장소별 득표 수 { placeId: count } */
export async function getVoteCounts(
  supabase: DbClient,
  meetupId: string
): Promise<Record<string, number>> {
  const votes = await getVotesByMeetup(supabase, meetupId);
  const counts: Record<string, number> = {};
  for (const v of votes) {
    counts[v.place_id] = (counts[v.place_id] ?? 0) + 1;
  }
  return counts;
}

/** 이 약속에서 내가 투표한 place_id 목록 */
export async function getMyVotedPlaceIds(
  supabase: DbClient,
  meetupId: string
): Promise<string[]> {
  const userId = await requireUserId(supabase);
  const votes = await getVotesByMeetup(supabase, meetupId);
  return votes.filter((v) => v.user_id === userId).map((v) => v.place_id);
}

/**
 * 투표 토글: 이미 내가 이 장소에 투표했으면 취소, 아니면 투표.
 * @returns 토글 후 상태 — true(투표됨) / false(취소됨)
 */
export async function toggleVote(
  supabase: DbClient,
  placeId: string
): Promise<boolean> {
  const userId = await requireUserId(supabase);

  const { data: existing, error: selectError } = await supabase
    .from("votes")
    .select("id")
    .eq("place_id", placeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from("votes")
    .insert({ place_id: placeId, user_id: userId });
  if (error) throw error;
  return true;
}
