import type { CSSProperties } from "react";
import Avatar from "./Avatar";
import styles from "./AvatarGroup.module.css";

export type AvatarGroupMember = {
  name: string;
  src?: string | null;
};

export type AvatarGroupProps = {
  /** 표시할 멤버 목록 */
  members: AvatarGroupMember[];
  /** 최대 표시 인원. 초과분은 맨 끝 +N 원으로 묶인다. 기본 4 */
  max?: number;
  /** 각 아바타 지름(px). 기본 40 */
  size?: number;
  className?: string;
};

/**
 * 프로필 원들을 겹쳐서 보여주는 묶음.
 * - 오른쪽 원이 위로 겹쳐 있고,
 * - 특정 원에 마우스를 올리면 그 오른쪽 원들이 밀려나 호버한 프로필이 온전히 보인다.
 * - `max`를 넘는 인원은 맨 끝에 `+N` 원으로 표시된다.
 */
export default function AvatarGroup({
  members,
  max = 4,
  size = 40,
  className = "",
}: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;

  // 겹침 정도 = 호버 시 밀어내는 거리 (지름에 비례)
  const overlap = Math.round(size * 0.32);

  // CSS 변수(--push)로 밀어내는 거리를 CSS 모듈에 전달
  const containerStyle = { "--push": `${overlap}px` } as CSSProperties;

  return (
    <div className={`flex ${className}`} style={containerStyle}>
      {visible.map((member, i) => (
        <div
          key={`${member.name}-${i}`}
          className={styles.item}
          style={{ marginLeft: i === 0 ? 0 : -overlap }}
        >
          <Avatar name={member.name} src={member.src} size={size} />
        </div>
      ))}

      {overflow > 0 && (
        <div className={styles.item} style={{ marginLeft: -overlap }}>
          <div
            role="img"
            aria-label={`외 ${overflow}명`}
            style={{ width: size, height: size, fontSize: size * 0.34 }}
            className="flex select-none items-center justify-center rounded-full bg-[#dcdfdd] font-semibold text-muted ring-2 ring-surface"
          >
            +{overflow}
          </div>
        </div>
      )}
    </div>
  );
}
