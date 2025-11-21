"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoading } = useStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
        const isPublicRoute = pathname === "/";

        if (!currentUser && !isAuthRoute && !isPublicRoute) {
            router.push("/login");
        }

        if (currentUser && isAuthRoute) {
            if (currentUser.role === "admin") {
                router.push("/admin/customers");
            } else {
                router.push("/dashboard/dialer");
            }
        }
    }, [currentUser, pathname, router, mounted]);

    if (!mounted) return null;

    return <>{children}</>;
}
