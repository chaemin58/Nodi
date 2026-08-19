import SquarePlus from "@/assets/squre-plus.svg";

export function MeetingAddCard() {
  return (
    <div className="w-full cursor-pointer overflow-hidden border-border rounded-2xl bg-surface border-2 border-dashed p-5 flex flex-col justify-center items-center gap-3 self-stretch">
      <SquarePlus className="w-10 text-gray-400" />
      <div className="flex items-center justify-center font-semibold text-gray-400">
        모임 생성하기
      </div>
    </div>
  );
}
