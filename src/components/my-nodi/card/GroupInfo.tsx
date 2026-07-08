import { BadgeKind } from "@/tokens/badges";
import { Badge } from "@/components/Badge/Badge";

interface GroupInfoProps {
  title: string;
  badgeType: BadgeKind;
  meetingCount: number;
  headCount: number;
}
export function GroupInfo({ title, badgeType, meetingCount, headCount }: GroupInfoProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold">{title}</div>
        <Badge type={badgeType} />
      </div>
      <div className="text-sm text-muted">
        멤버 {headCount}명 · {meetingCount}번 nodi 했어요
      </div>
    </div>
  );
}
