import { createClient } from "./supabase/client";

export const handlekakaoLogin = async () => {
  const supabase = createClient();

  await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};
