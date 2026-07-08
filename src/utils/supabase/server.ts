// 서버(서버 컴포넌트 / 라우트 핸들러 / 서버 액션)용 Supabase 클라이언트
// Next.js 16: cookies() 는 async 이므로 반드시 await.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 서버 컴포넌트에서 호출된 경우 set이 막힘 — proxy(세션 갱신)가 처리하므로 무시 가능.
        }
      },
    },
  });
}
