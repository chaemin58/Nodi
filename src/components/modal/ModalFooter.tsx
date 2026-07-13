import { useContext } from "react";
import { ModalContext } from "./Modal";

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("ModalFooter는 Modal 안에서만 사용할 수 있습니다.");

  const { isDismissable } = ctx;

  // 무시할 수 없는데(선택 강제) 버튼을 안 넘겨주면 에러
  if (!isDismissable && !children) {
    throw new Error("isDismissable이 false인 모달은 ModalFooter에 버튼이 필요합니다.");
  }

  return <div className={className}>{children}</div>;
}
