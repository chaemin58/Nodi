"use client";

import { useState } from "react";
import EyeOnIcon from "@/assets/eyeon.svg";
import EyeOffIcon from "@/assets/eyeoff.svg";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  warningText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  isWarning?: boolean;
}

export default function Input({
  warningText,
  prefix,
  suffix,
  isWarning,
  className,
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "focus-within:border-text-primary flex h-[54px] items-center gap-2 rounded-2xl border px-4 has-[:disabled]:opacity-40",
          isWarning ? "border-red-500" : "border-gray-200",
        )}
      >
        {prefix}
        <input
          className="w-full bg-transparent text-gray-950 placeholder-gray-400 outline-none disabled:cursor-not-allowed"
          type={isPassword ? (showPassword ? "text" : "password") : type}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className="cursor-pointer disabled:cursor-not-allowed"
            disabled={props.disabled}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <EyeOnIcon width={20} height={20} />
            ) : (
              <EyeOffIcon width={20} height={20} />
            )}
          </button>
        ) : (
          suffix
        )}
      </div>
      {isWarning && warningText && <p className="text-sm text-red-500">{warningText}</p>}
    </div>
  );
}
