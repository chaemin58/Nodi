import Edit from "@/assets/icon/icon_edit.svg";
import { AvatarGroup, AvatarGroupMember } from "../avatar";
import { NodiDiscription } from "./NodiDescription";

interface NodiDetailHeaderProps {
  nodiTitle: string;
  statusMessage?: string;
  members: AvatarGroupMember[];
  headCount: number;
  startDate: Date;
}

export function NodiDetailHeader({
  nodiTitle,
  statusMessage,
  members,
  headCount,
  startDate,
}: NodiDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-2 lg:border-border-default w-full lg:py-8 lg:pl-8 lg:border lg:rounded-[29px] lg:bg-white">
      <div className="text-text-primary text-2xl font-semibold lg:text-[28px] lg:font-bold">
        {nodiTitle}
      </div>
      <div className="flex gap-1">
        <div className="text-text-placeholder lg:text-sm">{statusMessage}</div>
        <Edit className="w-3 fill-text-placeholder cursor-pointer" />
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
