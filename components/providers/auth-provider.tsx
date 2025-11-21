"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "loading") return;

        const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
        const isPublicRoute = pathname === "/";

        if (status === "unauthenticated" && !isAuthRoute && !isPublicRoute) {
            router.push("/login");
        }

        if (status === "authenticated" && isAuthRoute) {
            if (session?.user?.role === "ADMIN") {
                router.push("/admin/customers");
            } else {
                router.push("/dashboard/dialer");
            }
        }
    }, [session, status, pathname, router]);

    if (status === "loading") {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthGuard>{children}</AuthGuard>
        </SessionProvider>
    );
}
