"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";

export default function Home() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-8">
      <p>Nodi입니다.</p>

      {/* isDismissable: false → 헤더 있고, esc/외부클릭으로 닫힘 */}
      <button onClick={() => setIsInfoOpen(true)}>안내 모달 열기</button>
      {isInfoOpen && (
        <Modal isDismissable={false} onClose={() => setIsInfoOpen(false)}>
          <Modal.Header>안내</Modal.Header>
          <Modal.Body>필독 사항이 아니라서 그냥 닫을 수 있어요.</Modal.Body>
        </Modal>
      )}

      {/* isDismissable: true → 헤더 없고, 버튼 선택 전엔 안 닫힘 */}
      <button onClick={() => setIsDeleteOpen(true)}>삭제 모달 열기</button>
      {isDeleteOpen && (
        <Modal isDismissable={true} onClose={() => setIsDeleteOpen(false)}>
          <Modal.Body>정말 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.</Modal.Body>
          <Modal.Footer>
            <button onClick={() => setIsDeleteOpen(false)}>취소</button>
            <button
              onClick={() => {
                // 실제 삭제 로직
                setIsDeleteOpen(false);
              }}
            >
              삭제
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
