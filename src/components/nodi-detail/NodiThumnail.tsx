import { cn } from "@/lib/utils";
import Logo from "@/assets/icon/logo.svg";

export function NodiThumnail({ emoji, className }: { emoji?: string; className?: string }) {
  return (
    <div
      className={cn(
        "h-12 w-12 lg:h-16 lg:w-16 bg-primary-tinted flex items-center justify-center rounded-xl",
        className,
      )}
    >
      {emoji ? (
        <span className="text-2xl lg:text-3xl">{emoji}</span>
      ) : (
        <Logo className="w-6 lg:w-8" />
      )}
    </div>
  );
}
