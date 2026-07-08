import { BADGE, BadgeKind } from "@/tokens/badges";


interface BadgeProp {
  type: BadgeKind;
  daysLeft?: number;
}
export function Badge({ type, daysLeft }: BadgeProp) {
  const { label, className } = BADGE[type];

  return (
    <div className={`inline-flex rounded-md px-1.5 py-1 text-sm ${className}`}>
      {type === "dday" ? `D-${daysLeft}` : label}
    </div>
  );
}
