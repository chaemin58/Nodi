import { getDaysSince } from "@/utils/date";

interface NodiDiscriptionProps {
  headCount: number;
  startDate: Date;
}

export function NodiDiscription({ headCount, startDate }: NodiDiscriptionProps) {
  const daysSinceStart = getDaysSince(startDate);

  return (
    <div className="text-sm text-text-placeholder">
      멤버 <span className="text-text-secondary">{headCount}</span>명 · 함께한 지{" "}
      <span className="text-text-secondary">{daysSinceStart}</span>일
    </div>
  );
}
