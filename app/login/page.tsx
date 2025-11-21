"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { users, setCurrentUser } = useStore();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find((u) => u.email === email);

        if (user) {
            setCurrentUser(user);
            if (user.role === "admin") {
                router.push("/admin/customers");
            } else {
                router.push("/dashboard/dialer");
            }
        } else {
            setError("User not found. Try 'admin@example.com' or 'customer@example.com'");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                        Enter your email to access the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>
                        <div className="mt-4 text-xs text-muted-foreground text-center">
                            <p>Demo Credentials:</p>
                            <p>Admin: admin@example.com</p>
                            <p>Customer: customer@example.com</p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
