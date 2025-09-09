// src/auth/AuthContext.tsx
import { signOut as amplifySignOut, fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type AuthCtx = {
    token: string | null;
    userId: string | null;
    loading: boolean;
    refresh: () => Promise<string | null>;
    signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadSession = useCallback(async () => {
        try {
            const s = await fetchAuthSession();
            const t =
                s.tokens?.accessToken?.toString() ??
                s.tokens?.idToken?.toString() ??
                null;
            setToken(t);
            // best-effort user id
            const sub =
                (s.tokens as any)?.idToken?.payload?.sub ??
                (s.tokens as any)?.accessToken?.payload?.sub ??
                null;
            setUserId(sub);
            return t;
        } catch {
            setToken(null);
            setUserId(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSession();
        const unlisten = Hub.listen("auth", ({ payload }) => {
            switch (payload.event) {
                case "signedIn":
                case "tokenRefresh":
                    loadSession();
                    break;
                case "signedOut":
                    setToken(null);
                    setUserId(null);
                    break;
            }
        });
        return unlisten;
    }, [loadSession]);

    const refresh = useCallback(async () => loadSession(), [loadSession]);

    const signOut = useCallback(async () => {
        await amplifySignOut();
        setToken(null);
        setUserId(null);
    }, []);

    return (
        <Ctx.Provider value={{ token, userId, loading, refresh, signOut }}>
            {children}
        </Ctx.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}

// If you must have a default export (for Expo Router):
export default function Dummy() {
    return null;
}