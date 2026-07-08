export type BoardStatus = "voting" | "confirmed";

export type Board = {
  id: string;
  title: string;
  emoji: string;
  memberCount: number;
  placeCount: number;
  status: BoardStatus;
  confirmedPlace?: string;
  updatedAt: string; // 표시용 상대 시간
};

// 실제 데이터는 나중에 Supabase에서. 지금은 화면 확인용 더미.
export const dummyBoards: Board[] = [
  {
    id: "1",
    title: "금요일 저녁 회식",
    emoji: "🍻",
    memberCount: 5,
    placeCount: 4,
    status: "voting",
    updatedAt: "10분 전",
  },
  {
    id: "2",
    title: "주말 브런치 모임",
    emoji: "🥞",
    memberCount: 3,
    placeCount: 6,
    status: "confirmed",
    confirmedPlace: "연남동 오소이",
    updatedAt: "어제",
  },
  {
    id: "3",
    title: "동아리 MT 장소",
    emoji: "🏕️",
    memberCount: 12,
    placeCount: 8,
    status: "voting",
    updatedAt: "3일 전",
  },
];
