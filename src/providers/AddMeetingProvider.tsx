"use client";

import { Button } from "@/components/Button/Button";
import Input from "@/components/input";
import { Modal } from "@/components/modal";
import { createContext, ReactNode, useState } from "react";

type AddMeetingContextValue = {
  open: () => void;
};

export const AddMeetingContext = createContext<AddMeetingContextValue | null>(null);

export function AddMeetingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <AddMeetingContext.Provider value={{ open }}>
      {children}

      {isOpen && (
        <Modal isDismissable={true} onClose={close}>
          <Modal.Header className="font-semibold text-lg"> 새 모임 만들기</Modal.Header>
          <Input placeholder="모임 이름" className="px-4 pb-1 pt-3" />
          <Modal.Footer className="flex gap-2 p-4">
            <Button variant="secondary" onClick={close}>
              취소
            </Button>
            {/* TODO: onClick 에서 createGroup 호출 */}
            <Button variant="primary">만들기</Button>
          </Modal.Footer>
        </Modal>
      )}
    </AddMeetingContext.Provider>
  );
}
