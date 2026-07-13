"use client";

import { handlekakaoLogin } from "@/utils/kakaoLogin";

export default function LoginPage() {
  return (
    <div>
      <button className="w-30 h-10 border" onClick={handlekakaoLogin}>
        로그인하기
      </button>
    </div>
  );
}
