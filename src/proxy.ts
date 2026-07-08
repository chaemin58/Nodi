// Next.js 16: 예전 middleware.ts 자리. 함수명·파일명 모두 proxy.
// 하는 일: 매 요청마다 Supabase 세션(auth 토큰)을 갱신.
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 정적 파일·이미지 최적화·favicon 제외한 모든 경로에서 실행
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
