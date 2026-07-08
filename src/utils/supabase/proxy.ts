// Supabase 세션 갱신 헬퍼 — 루트 proxy.ts 에서 호출.
// 매 요청마다 auth 토큰을 새로고침해서 만료를 막는다.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  // 아직 Supabase 키가 없으면(초기 개발 단계) 그냥 통과.
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // 중요: createServerClient 와 getUser() 사이에 다른 코드를 넣지 말 것.
  // (토큰 갱신 타이밍이 어긋나 로그아웃되는 버그를 유발)
  await supabase.auth.getUser();

  return supabaseResponse;
}
