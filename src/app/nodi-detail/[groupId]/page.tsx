import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getGroup, getGroupMembers, getMeetupsByGroup } from "@/api";
import type { AvatarGroupMember } from "@/components/avatar";
import type { BadgeKind } from "@/tokens/badges";
import { NodiDetailHeader } from "@/components/nodi-detail/NodiDetailHeader";
import { NodiHistoryBoard } from "@/components/nodi-detail/NodiHistoryBoard";
import { CurrentNodi } from "@/components/nodi-detail/CurrentNodi";

export default async function NodiDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  //게이트 먼저처리
  const group = await getGroup(supabase, groupId);
  if (!group) notFound();

  //다음 필요한 값 병렬 요청
  const [memberRows, meetups] = await Promise.all([
    getGroupMembers(supabase, groupId),
    getMeetupsByGroup(supabase, groupId),
  ]);

  const members: AvatarGroupMember[] = memberRows.map((m) => ({
    name: m.profiles?.nickname ?? "회원",
    src: m.profiles?.avatar_url ?? null,
  }));

  // getMeetupsByGroup은 최신순이므로 첫 번째가 진행 중인 약속.
  const currentMeetup = meetups[0];

  // "마지막 만남" — 날짜가 잡힌 약속 중 가장 최근. 없으면 null.
  const lastMeetDate = meetups
    .map((m) => m.meet_date)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6 lg:gap-10">
      <NodiDetailHeader
        nodiTitle={group.name}
        // DB는 "없음"을 null로, prop은 undefined로 표현한다
        statusMessage={group.status_message ?? undefined}
        members={members}
        headCount={members.length}
        startDate={new Date(group.created_at)}
        groupId={groupId}
      />

      <NodiHistoryBoard
        startDate={new Date(group.created_at)}
        nodiCount={meetups.length}
        lastNodi={lastMeetDate ? new Date(lastMeetDate) : null}
        // TODO: 다녀온 장소 수 — places 집계가 없어 아직 0으로 둔다.
        visitedPlaceCounter={0}
      />

      <CurrentNodi
        meetupTitle={currentMeetup?.title}
        badgeType={currentMeetup?.status as BadgeKind | undefined}
      />
    </div>
  );
}
