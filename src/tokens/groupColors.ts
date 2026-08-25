// 모임 카드 커버 색.
// 실제 색상값은 styles/tokens.css의 --color-cover-* 가 갖고 있고,
// 여기엔 "고를 수 있는 이름 목록"만 둔다. (팔레트를 아는 곳은 한 군데)

/** 사용자가 고를 수 있는 색. gray는 일부러 뺐다 — 아래 UNSET 참고. */
export const GROUP_COLORS = [
  "coral",
  "peach",
  "amber",
  "lemon",
  "olive",
  "mint",
  "teal",
  "sky",
  "blue",
  "indigo",
  "lilac",
  "plum",
  "pink",
  "rose",
] as const;

export type GroupColor = (typeof GROUP_COLORS)[number];

/**
 * 색이 지정되지 않은 모임 (DB의 default).
 * 팔레트에 넣지 않아서 "회색 = 아무도 색을 안 정함"이 항상 참이 된다.
 */
export const GROUP_COLOR_UNSET = "gray";

/** 팔레트에서 무작위로 하나. 모임 생성 시 기본값으로 쓴다. */
export function randomGroupColor(): GroupColor {
  return GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
}

/**
 * 색 이름 → CSS 배경값.
 * 팔레트에 없는 값(오래된 데이터·오타)이 오면 회색으로 안전하게 떨어진다.
 */
export function coverColorVar(color: string | undefined): string {
  const known = (GROUP_COLORS as readonly string[]).includes(color ?? "");
  return `var(--color-cover-${known ? color : GROUP_COLOR_UNSET})`;
}
