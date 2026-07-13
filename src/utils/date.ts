/** 특정 날짜로부터 오늘까지 며칠 지났는지 계산 (당일 = 1일) */
export function getDaysSince(startDate: Date): number {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const today = new Date();
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((now.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}
