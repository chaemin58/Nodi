import { cn } from "@/lib/utils";

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}
