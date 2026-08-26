"use client";

import { useRef, useState } from "react";
import Edit from "@/assets/icon/icon_edit.svg";
import { AvatarGroup, AvatarGroupMember } from "../avatar";
import { NodiDiscription } from "./NodiDescription";
import { createClient } from "@/utils/supabase/client";
import { updateStatusMessage } from "@/api";

interface NodiDetailHeaderProps {
  nodiTitle: string;
  statusMessage?: string;
  members: AvatarGroupMember[];
  headCount: number;
  startDate: Date;
  groupId: string;
}

export function NodiDetailHeader({
  nodiTitle,
  statusMessage,
  members,
  headCount,
  startDate,
  groupId,
}: NodiDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(statusMessage ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const savedRef = useRef(statusMessage ?? "");

  const handleEditStatusMessage = () => {
    setIsEditing(true);
    // readOnly가 풀리는 건 다음 렌더라, 그 뒤에 포커스를 준다.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setValue(savedRef.current);
      inputRef.current?.blur();
    }
  };

  const handleBlur = async () => {
    setIsEditing(false);
    const next = value.trim();
    if (next === savedRef.current) return;
    //실제 저장
    const supabase = createClient();
    await updateStatusMessage(supabase, groupId, next);
  };

  return (
    <div className="flex min-w-100 flex-col gap-2 lg:border-border-default w-full lg:py-8 lg:pl-8 lg:border lg:rounded-[29px] lg:bg-white">
      <div className="text-text-primary text-2xl font-semibold lg:text-[28px] lg:font-bold">
        {nodiTitle}
      </div>
      <div className="flex gap-1">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={!isEditing}
          maxLength={100}
          placeholder="한 줄 남겨보세요"
          className={`field-sizing-content border-0 bg-transparent p-0 text-text-placeholder outline-none lg:text-sm ${
            isEditing ? "bg-primary-tinted rounded px-1" : "cursor-pointer"
          }`}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        <Edit
          className="w-3 fill-text-placeholder cursor-pointer"
          onClick={handleEditStatusMessage}
        />
      </div>
      <div className="hidden lg:flex">
        <AvatarGroup members={members} size={25} />
      </div>
      <div className="lg:hidden flex gap-5 items-center">
        <AvatarGroup members={members} size={30} />
        <NodiDiscription headCount={headCount} startDate={startDate} />
      </div>
    </div>
  );
}
