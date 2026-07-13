import { NodiDetailHeader } from "@/components/nodi-detail/NodiDetailHeader";

export default function Home() {
  return (
    <NodiDetailHeader
      nodiTitle="고등학교 모임"
      statusMessage="우리 언제만남?"
      members={[
        { name: "지훈" },
        { name: "34" },
        { name: "김성진" },
        { name: "김성진" },
        { name: "tlqkf" },
        { name: "hi" },
      ]}
      startDate={new Date("2026-01-01")}
      headCount={6}
    />
  );
}
