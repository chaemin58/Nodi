// OAuth(카카오 등) 로그인이 끝나면 Supabase가 이 주소로 돌려보낸다.
// 프론트에서 signInWithOAuth 호출 시 redirectTo 를 `${origin}/auth/callback` 로 지정해야 함.
//
// 여기서 하는 일: URL에 실려온 code 를 실제 로그인 세션(쿠키)으로 교환.
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 배포 환경(Vercel 등)은 프록시 뒤에 있어 origin이 내부 주소로 잡힐 수 있음.
      // x-forwarded-host 가 있으면 그걸 우선 써서 실제 공개 주소로 리다이렉트.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // code가 없거나 세션 교환 실패 → 홈으로, 프론트가 원하면 이 쿼리로 에러 표시 가능
  return NextResponse.redirect(`${origin}/?authError=1`);
}
