// POST /api/meetups
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseEnv } from "@/utils/supabase/env";

export async function POST(request: NextRequest) {
  const { groupId, title } = await request.json();

  if (!groupId) {
    return Response.json({ error: "모임 정보가 필요합니다." }, { status: 400 });
  }
  if (!title || !title.trim()) {
    return Response.json({ error: "약속 이름이 필요합니다." }, { status: 400 });
  }

  // 1: 쿠키에서 로그인 세션(토큰) 읽기
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { url, anonKey } = getSupabaseEnv();

  try {
    // 2: meetups 에 insert.
    //    created_by 를 직접 채워야 한다 — meetups_insert 정책이
    //    "is_group_member(group_id) and created_by = auth.uid()" 라서
    //    비워두면 RLS 에 막힌다. 그 모임의 멤버인지도 같은 정책이 검사한다.
    //
    //    status / is_shared / share_token 은 DB 기본값에 맡긴다.
    //    meet_date / emoji 는 아직 안 받는다 (null = 미정).
    const res = await fetch(`${url}/rest/v1/meetups`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        group_id: groupId,
        title: title.trim(),
        created_by: session.user.id,
      }),
    });

    if (!res.ok) {
      // 원인은 서버 로그로만 남긴다 (DB 에러 내용을 브라우저에 노출하지 않기 위해).
      console.error("[/api/meetups] insert 실패:", res.status, await res.text());
      return Response.json({ error: "약속 생성에 실패했어요." }, { status: 500 });
    }

    // 3) 만들어졌다는 사실만 알린다.
    //    행을 돌려받으려면(Prefer: return=representation) select 정책까지 통과해야 하는데,
    //    can_view_meetup(id) 이 방금 넣은 행을 못 봐서 거부된다. 화면 갱신은
    //    router.refresh() 로 서버에서 다시 읽어오면 되므로 여기서 돌려줄 필요가 없다.
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[/api/meetups] 약속 생성 실패:", err);
    return Response.json({ error: "약속 생성 중 오류가 발생했어요." }, { status: 500 });
  }
}
