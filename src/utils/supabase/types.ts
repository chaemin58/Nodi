import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// api 함수들이 인자로 받는 클라이언트 타입.
// 서버(server.ts)든 브라우저(client.ts)든 이 타입으로 통일해서 넘긴다.
export type DbClient = SupabaseClient<Database>;
