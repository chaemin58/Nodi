/** 아바타 fallback(사진 없음)에 쓰는 파스텔 배경 + 글자색 한 쌍 */
export type AvatarColor = {
  /** 배경색 (연한 파스텔) */
  bg: string;
  /** 글자색 (같은 계열의 진한 톤) */
  text: string;
};

/** 닉네임 첫 글자 뒤에 깔릴 색 팔레트 */
const PALETTE: AvatarColor[] = [
  { bg: "#E3F5EC", text: "#1D9E75" }, // green
  { bg: "#FCE4EC", text: "#D6567E" }, // pink
  { bg: "#E6F0FB", text: "#3B7DD8" }, // blue
  { bg: "#FDECDD", text: "#E08A3C" }, // orange
  { bg: "#EFE7FB", text: "#8B5CF6" }, // purple
  { bg: "#E0F5F3", text: "#14A79A" }, // teal
  { bg: "#FBF3DA", text: "#C99A2E" }, // amber
  { bg: "#FBE7E7", text: "#D65656" }, // rose
];

/**
 * 닉네임을 해시해서 팔레트 중 하나를 고른다.
 * 같은 닉네임은 언제나 같은 색이 나오도록 결정적(deterministic)으로 계산.
 */
export function colorFromName(name: string): AvatarColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    // 31을 곱하며 누적하는 흔한 문자열 해시. >>> 0 으로 32비트 양수 유지
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

/** 닉네임의 첫 글자. 라틴 문자면 대문자로. */
export function initialFromName(name: string): string {
  const ch = name.trim().charAt(0);
  return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
}
