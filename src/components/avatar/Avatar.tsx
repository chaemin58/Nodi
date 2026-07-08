import { colorFromName, initialFromName } from "./colors";

export type AvatarProps = {
  /** 표시할 닉네임 (fallback 글자·색의 기준) */
  name: string;
  /** 프로필 사진 URL. 없으면 첫 글자 + 파스텔 배경으로 대체 */
  src?: string | null;
  /** 지름(px). 기본 40 */
  size?: number;
  /** 겹칠 때 원끼리 떨어져 보이게 하는 테두리 표시 여부. 기본 true */
  ring?: boolean;
  className?: string;
};

/**
 * 개별 프로필 원.
 * - `src`가 있으면 사진을 원형으로 보여주고,
 * - 없으면 닉네임 첫 글자를 파스텔 배경 위에 보여준다.
 */
export default function Avatar({
  name,
  src,
  size = 40,
  ring = true,
  className = "",
}: AvatarProps) {
  const ringClass = ring ? "ring-2 ring-surface" : "";

  if (src) {
    return (
      // 외부 URL(Supabase Storage 등)을 자유롭게 받기 위해 next/image 대신 img 사용
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover ${ringClass} ${className}`}
      />
    );
  }

  const { bg, text } = colorFromName(name);
  return (
    <div
      role="img"
      aria-label={name}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: text,
        fontSize: size * 0.42,
      }}
      className={`flex select-none items-center justify-center rounded-full font-semibold ${ringClass} ${className}`}
    >
      {initialFromName(name)}
    </div>
  );
}
