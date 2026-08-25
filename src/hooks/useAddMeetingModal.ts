import { useContext } from "react";
import { AddMeetingContext } from "@/providers/AddMeetingProvider";

//모달을 여는 open 스위치를 건드리는 훅
export const useAddMeetingModal = () => {
  const ctx = useContext(AddMeetingContext);
  if (!ctx) {
    throw new Error("useAddMeetingModal은 AddMeetingProvider 안d에서 사용.");
  }

  return ctx;
};
