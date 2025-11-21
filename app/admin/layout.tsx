"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Mic, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { setCurrentUser } = useStore();

    const handleLogout = () => {
        setCurrentUser(null);
        router.push("/login");
    };

    const navItems = [
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/voices", label: "Voices & Providers", icon: Mic },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start", isActive && "bg-secondary")}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
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
