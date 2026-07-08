// GET /api/search?query=성수동 카페
// 프론트가 부르는 "장소 검색 창구". 서버에서 네이버에 대신 물어보고 결과를 돌려준다.
import type { NextRequest } from "next/server";
import { searchPlaces } from "@/utils/naver";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  // 검색어가 없으면 400 (잘못된 요청)
  if (!query) {
    return Response.json(
      { error: "query 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const places = await searchPlaces(query);
    return Response.json({ places });
  } catch (err) {
    // 키 누락 등 서버 설정 문제 → 500, 네이버 쪽 문제 → 502 로 구분
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    const isConfig = message.includes("환경변수");
    return Response.json(
      { error: message },
      { status: isConfig ? 500 : 502 }
    );
  }
}
