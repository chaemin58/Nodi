"use client";

import { type GroupRow } from "@/api";
import { Button } from "@/components/Button/Button";
import Input from "@/components/input";
import { Modal } from "@/components/modal";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useState } from "react";

type AddMeetingContextValue = {
  open: () => void;
};

export const AddMeetingContext = createContext<AddMeetingContextValue | null>(null);

export function AddMeetingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [step, setStep] = useState<"form" | "done">("form");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [createdGroup, setCreatedGroup] = useState<GroupRow | null>(null);

  const open = () => setIsOpen(true);

  // 닫을 때 다음 열림을 위해 상태 초기화
  const close = () => {
    setIsOpen(false);
    setStep("form");
    setMeetingTitle("");
    setCreatedGroup(null);
    setIsError(false);
    router.refresh();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      // 브라우저 → 내 서버 라우트로 요청 (쿠키가 자동으로 실려감)
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: meetingTitle }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("[모임 생성] 서버 응답:", res.status, json); // 진짜 원인 출력
        throw new Error("모임 생성 실패");
      }

      const { group } = json;
      setCreatedGroup(group); // 생성된 모임(이름·초대코드 등) 보관
      setStep("done"); // 완료 화면으로 전환
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 초대 링크를 클립보드에 복사
  const handleCopyInvite = () => {
    if (!createdGroup) return;
    const link = `${window.location.origin}/invite/${createdGroup.invite_code}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <AddMeetingContext.Provider value={{ open }}>
      {children}

      {isOpen && (
        // 완료 단계에서는 X·바깥클릭으로 못 닫게 (확인 버튼으로만)
        <Modal isDismissable={step === "form"} onClose={close}>
          {step === "form" ? (
            <>
              <Modal.Header className="font-semibold text-lg">새 모임 만들기</Modal.Header>
              <Input
                placeholder="모임 이름"
                className="px-4 pb-1 pt-3"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
              {isError && <p className="px-4 text-sm text-error">모임 생성에 실패했어요.</p>}
              <Modal.Footer className="flex gap-2 p-4">
                <Button variant="secondary" onClick={close}>
                  취소
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isLoading || !meetingTitle.trim()}
                >
                  {isLoading ? "만드는 중..." : "만들기"}
                </Button>
              </Modal.Footer>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 p-6 text-center">
                {/* 이름 뒤 조사는 받침에 따라 달라지므로, 뒤에 고정어(모임이)를 붙여 회피 */}
                <p className="text-lg font-semibold">
                  &lsquo;{createdGroup?.name}&rsquo; 모임이 만들어졌어요!
                </p>
                <p className="text-sm text-gray-400">초대 링크를 복사해 친구를 초대해보세요.</p>
              </div>
              <Modal.Footer className="flex gap-2 p-4">
                <Button variant="secondary" onClick={handleCopyInvite}>
                  초대 링크 복사
                </Button>
                <Button variant="primary" onClick={close}>
                  확인
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal>
      )}
    </AddMeetingContext.Provider>
  );
}
