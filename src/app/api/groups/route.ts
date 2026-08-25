// POST /api/groups
// 브라우저가 "모임 만들어줘" 하고 부르는 서버 창구.
//
// 모임 생성은 DB 함수(create_group_with_owner) 한 번 호출로 끝낸다.
// 그 함수가 "모임 생성 + 만든 사람을 owner 멤버로 등록"을 원자적으로 처리한다.
// (앱에서 두 번 insert 하던 방식은 단계마다 RLS 정책에 막힐 수 있어 취약했다.)
//
// 토큰은 Authorization 헤더에 직접 싣는다 — 쿠키 기반 supabase-js 클라이언트가
// PostgREST 요청에 JWT를 안 붙여서 auth.uid()가 null이 되는 문제가 있었다.
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseEnv } from "@/utils/supabase/env";
import { GROUP_COLORS, randomGroupColor } from "@/tokens/groupColors";

export async function POST(request: NextRequest) {
  const { name, color } = await request.json();

  if (!name || !name.trim()) {
    return Response.json({ error: "모임 이름이 필요합니다." }, { status: 400 });
  }

  // 1) 쿠키에서 로그인 세션(토큰) 읽기
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // 팔레트에 없는 값이 오면(오타·오래된 클라이언트) 무작위 색으로 대체한다.
  // 여기서 걸러야 DB에 이상한 색 이름이 쌓이지 않는다.
  const safeColor = (GROUP_COLORS as readonly string[]).includes(color)
    ? (color as string)
    : randomGroupColor();

  const { url, anonKey } = getSupabaseEnv();

  try {
    // 2) DB 함수 호출 — 모임 생성과 owner 멤버 등록이 한 트랜잭션으로 처리된다.
    const res = await fetch(`${url}/rest/v1/rpc/create_group_with_owner`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _name: name.trim(), _color: safeColor }),
    });

    if (!res.ok) {
      // 원인은 서버 로그로만 남긴다 (DB 에러 내용을 브라우저에 노출하지 않기 위해).
      console.error("[/api/groups] create_group_with_owner 실패:", res.status, await res.text());
      return Response.json({ error: "모임 생성에 실패했어요." }, { status: 500 });
    }

    // 3) 생성된 모임(초대코드 등) 돌려주기
    const group = await res.json();
    return Response.json({ group });
  } catch (err) {
    console.error("[/api/groups] 모임 생성 실패:", err);
    return Response.json({ error: "모임 생성 중 오류가 발생했어요." }, { status: 500 });
  }
}
