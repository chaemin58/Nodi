import Logo from "@/assets/icon/logo.svg";
import ArrowRight from "@/assets/icon/right_arrow.svg";
import { NodiThumnail } from "./NodiThumnail";
import { Badge } from "../Badge";
import { BadgeKind } from "@/tokens/badges";
import { Button } from "../Button/Button";

interface CurrentNodiProps {
  meetupTitle?: string;
  location?: string;
  badgeType?: BadgeKind;
  daysLeft?: number;
  thumnnail?: string;
}
export function CurrentNodi({
  meetupTitle,
  location,
  badgeType,
  daysLeft,
  thumnnail,
}: CurrentNodiProps) {
  return (
    <div className="flex flex-col gap-3 lg:gap-5">
      <div className="flex gap-2.5 items-center">
        <Logo className="w-5.5" />
        <div className="font-semibold lg:text-lg">진행 중인 약속</div>
      </div>
      {meetupTitle ? (
        <div className="border-primary border-2 w-full lg:h-25 h-20 rounded-3xl flex items-center pl-3 pr-8 justify-between">
          <div className="flex gap-1 items-center">
            <NodiThumnail emoji={thumnnail} />
            <div className="flex flex-col mr-5">
              <div className="lg:text-[20px] text-md font-semibold">{meetupTitle}</div>
              <div className="text-sm text-text-placeholder ">{location}</div>
            </div>
            {badgeType && <Badge type={badgeType} daysLeft={daysLeft} />}
          </div>
          <ArrowRight className="w-2 h-4 cursor-pointer" />
        </div>
      ) : (
        <div className="border-border-default border-2 w-full lg:h-25 h-20 rounded-3xl flex items-center justify-center text-text-placeholder">
          진행 중인 약속이 없습니다
        </div>
      )}
      <Button size="md">약속 추가하기</Button>
    </div>
  );
}
