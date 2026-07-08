// Supabase 환경변수 읽기 — 값이 비어 있으면 어디를 채워야 하는지 알려준다.
// (.env.local 에 키를 넣기 전까지는 이 함수가 명확한 에러를 던진다)

/** 키가 둘 다 채워져 있는지 (proxy가 조용히 통과할지 판단용) */
export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "[Supabase] 환경변수가 없습니다. .env.local 에 " +
        "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 를 넣어주세요. " +
        "(값은 supabase.com → 프로젝트 → Settings → API 에서 복사)"
    );
  }

  return { url, anonKey };
}
