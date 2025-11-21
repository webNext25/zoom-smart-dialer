"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Phone, Settings, LogOut, Bot, Activity, ShoppingBag, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (session?.user?.role === "ADMIN") {
            router.push("/admin/customers");
        }
    }, [session, status, router]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    if (status === "loading") {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    const navItems = [
        { href: "/dashboard/dialer", label: "Smart Dialer", icon: Phone },
        { href: "/dashboard/agent", label: "Agent Settings", icon: Bot },
        { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        Zoom Dialer
                    </h1>
                </div>
                <nav className="space-y-2">
                    <Link
                        href="/dashboard/dialer"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                            pathname === "/dashboard/dialer" && "bg-muted text-primary"
                        )}
                    >
                        <Phone className="h-5 w-5" />
                        Smart Dialer
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                            pathname === "/dashboard/analytics" && "bg-muted text-primary"
                        )}
                    >
                        <Activity className="h-5 w-5" />
                        Analytics
                    </Link>
                    <Link
                        href="/dashboard/templates"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                            pathname === "/dashboard/templates" && "bg-muted text-primary"
                        )}
                    >
                        <ShoppingBag className="h-5 w-5" />
                        Templates
                    </Link>
                    <Link
                        href="/dashboard/recordings"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                            pathname === "/dashboard/recordings" && "bg-muted text-primary"
                        )}
                    >
                        <Play className="h-5 w-5" />
                        Recordings
                    </Link>
                    <Link
                        href="/dashboard/agent"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                            pathname === "/dashboard/agent" && "bg-muted text-primary"
                        )}
                    >
                        <Bot className="h-5 w-5" />
                        Agent Settings
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                            pathname === "/dashboard/settings" && "bg-muted text-primary"
                        )}
                    >
                        <Settings className="h-5 w-5" />
                        Account Settings
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
