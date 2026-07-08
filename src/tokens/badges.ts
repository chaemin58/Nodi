// 뱃지 토큰 — plan.md "상태 뱃지 / 넛지 뱃지 / 뱃지 색상" 규칙
// 색은 globals.css의 --color-badge-* 토큰과 1:1 대응.

export type BadgeKind =
  // 상태 (약속에 하나만 — 상호배타)
  | "voting" // 정하는 중
  | "confirmed" // 정해짐
  | "past" // 다녀옴
  // 넛지 (조건 맞을 때 겹쳐 뜸)
  | "soon" // 슬슬 만날 때
  | "dday" // D-3 등
  | "new" // 새 모임
  // 커플 (v2)
  | "couple";

interface BadgeSpec {
  label: string;
  /** 배경/글자 Tailwind 클래스 (globals.css 토큰 기반) */
  className: string;
}

export const BADGE: Record<BadgeKind, BadgeSpec> = {
  voting: { label: "정하는 중", className: "bg-badge-voting-bg text-badge-voting-fg" },
  confirmed: { label: "정해짐", className: "bg-badge-confirmed-bg text-badge-confirmed-fg" },
  past: { label: "다녀옴", className: "bg-badge-past-bg text-badge-past-fg" },
  soon: { label: "슬슬 만날 때", className: "bg-badge-soon-bg text-badge-soon-fg" },
  // label은 미사용(Badge 컴포넌트가 daysLeft로 동적 계산); className만 참조됨
  dday: { label: "D-3", className: "bg-badge-dday-bg text-badge-dday-fg" },
  new: { label: "새 모임", className: "bg-badge-confirmed-bg text-badge-confirmed-fg" },
  couple: { label: "커플", className: "bg-badge-couple-bg text-badge-couple-fg" },
};
