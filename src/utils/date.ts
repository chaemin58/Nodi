/** 특정 날짜로부터 오늘까지 며칠 지났는지 계산 (당일 = 1일) */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getDaysSince(startDate: Date): number {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const today = new Date();
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.floor((now.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

/** 특정 날짜로부터 오늘까지 며칠 지났는지 계산 후 일/주/달/년 단위 문자열로 변환 */
export function getDaysLastMeetingDays(lastMeeting: Date): string {
  const last = new Date(lastMeeting.getFullYear(), lastMeeting.getMonth(), lastMeeting.getDate());

  const today = new Date();
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const days = Math.floor((now.getTime() - last.getTime()) / MS_PER_DAY) + 1;

  if (days <= 6) {
    return `${days}일`;
  } else if (days <= 30) {
    return `${Math.floor(days / 7)}주`;
  } else if (days <= 365) {
    return `${Math.floor(days / 30)}개월`;
  } else {
    return `${Math.floor(days / 365)}년`;
  }
}
