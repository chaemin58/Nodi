import { GroupInfo } from "@/components/my-nodi/GroupInfo";
import { StatusDisplay } from "@/components/my-nodi/StatusDisplay";

export default function MynodiPage() {
  return (
    <div>
      <GroupInfo title="고등학교 모임" badgeType="voting" meetingCount={38} headCount={4} />
      <StatusDisplay
        type="confirmed"
        title="주말 브런치"
        url="https://github.com/chaemin58/Nodi/pulls"
      />
    </div>
  );
}
