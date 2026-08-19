import { NodiCard } from "@/components/my-nodi/card/NodiCard";
import { MeetingAddCard } from "@/components/my-nodi/card/MeetingAddCard";
import type { AvatarGroupMember } from "@/components/avatar";
import type { BadgeKind } from "@/tokens/badges";
import type { GroupSummary } from "@/api";

// page.tsx(서버 컴포넌트)에서 이미 가져온 "내 모임" 데이터를 props로 받는다.
// 이 컴포넌트는 데이터를 그리기만 함(프레젠테이셔널).
export default function NodiCardContainer({ groups }: { groups: GroupSummary[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 max-w-4xl">
      {groups.map((group) => {
        // 아바타 그룹이 원하는 모양 { name, src } 으로 변환
        const members: AvatarGroupMember[] = group.members.map((m) => ({
          name: m.nickname,
          src: m.avatarUrl,
        }));

        // 진행 중인 약속이 있으면 그 상태(정하는 중/정해짐), 없으면 "다녀옴"
        const badgeType: BadgeKind = group.currentMeetup?.status ?? "past";

        return (
          <NodiCard
            key={group.id}
            title={group.name}
            badgeType={badgeType}
            headCount={group.memberCount}
            meetingCount={group.meetupCount}
            members={members}
            name={group.currentMeetup?.title ?? ""}
            option={group.currentMeetup?.placeCount}
            url={group.currentMeetup?.confirmedPlace ?? undefined}
          />
        );
      })}
      <MeetingAddCard />
    </div>
  );
}
