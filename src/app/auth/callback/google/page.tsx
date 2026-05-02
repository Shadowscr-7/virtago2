"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, getRedirectForRole, UserRole } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithOAuth, rolePending, user } = useAuthStore();
  const { themeColors } = useTheme();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google OAuth error:", error);
      router.push("/login?error=oauth_failed");
      return;
    }

    if (!code) {
      router.push("/login");
      return;
    }

    // Exchange code for token via backend
    const exchangeCode = async () => {
      try {
        // The backend endpoint POST /api/auth/google accepts the OAuth code
        // and exchanges it with Google, returning a Virtago JWT
        await loginWithOAuth("google", code);
        // loginWithOAuth sets rolePending and isAuthenticated in store
        // The redirect is handled below
      } catch {
        router.push("/login?error=oauth_failed");
      }
    };

    exchangeCode();
  }, [searchParams, loginWithOAuth, router]);

  // Redirect after auth completes
  useEffect(() => {
    const { isAuthenticated, rolePending: rp } = useAuthStore.getState();
    if (isAuthenticated) {
      if (rp) {
        router.push("/login"); // login page will show RoleSelection
      } else if (user?.role) {
        router.push(getRedirectForRole(user.role as UserRole));
      }
    }
  }, [user, rolePending, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: themeColors.background }}
    >
      <div className="text-center space-y-4">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto"
          style={{ borderColor: `${themeColors.primary}40`, borderTopColor: themeColors.primary }}
        />
        <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
          Autenticando con Google...
        </p>
      </div>
    </div>
  );
}
