// Nodi 도메인 타입 — supabase/schema.sql 기준
// 계층: 모임(Group) → 약속(Meetup) → 후보장소(Place) → 투표(Vote)

export type GroupType = "friends" | "couple" | "family";

export type MeetupStatus = "voting" | "confirmed";

export interface Profile {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  createdAt: string;
}

export interface Meetup {
  id: string;
  groupId: string;
  title: string;
  status: MeetupStatus;
  meetDate?: string | null;
  isShared: boolean;
  createdAt: string;
}

export interface Place {
  id: string;
  meetupId: string;
  name: string;
  category?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  isConfirmed: boolean;
  courseOrder?: number | null;
}

export interface Vote {
  id: string;
  placeId: string;
  userId: string;
}
