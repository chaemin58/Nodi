import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getMyProfile, getMyGroupsSummary } from "@/api";
import NodiCardContainer from "@/components/my-nodi/NodiCardContainer";
import { MyNodiTitle } from "@/components/my-nodi/MyNodiTitle";

export default async function MynodiPage() {
  // 1) 서버용 Supabase 클라이언트. 요청에 담긴 쿠키에서 "로그인 세션"을 읽는다.
  const supabase = await createClient();

  // 2) 로그인한 사용자 확인. 없으면 로그인 페이지로 보낸다.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 3) 내 프로필(이름)과 내 모임 목록을 동시에 가져온다.
  //    RLS 덕분에 getMyGroupsSummary는 "내가 속한 모임"만 자동으로 돌려준다.
  const [profile, groups] = await Promise.all([
    getMyProfile(supabase),
    getMyGroupsSummary(supabase),
  ]);

  const name = profile?.nickname ?? "회원";

  return (
    <div>
      <MyNodiTitle name={name} />
      <NodiCardContainer groups={groups} />
    </div>
  );
}
