"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AccountSettingsPage() {
    const { data: user, error, isLoading } = useSWR("/api/users/me", fetcher);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleSave = async () => {
        try {
            const body: any = { name };
            if (password) {
                if (password.length < 6) {
                    toast.error("Password must be at least 6 characters");
                    return;
                }
                body.password = password;
            }

            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Failed to update");

            toast.success("Profile updated successfully!");
            setPassword("");
            mutate("/api/users/me");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading profile</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input value={user?.email || ""} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            placeholder="Leave blank to keep current password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSave}>Save Changes</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Usage & Limits</CardTitle>
                    <CardDescription>View your current plan usage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <p className="text-sm font-medium text-muted-foreground">Used Minutes</p>
                            <p className="text-2xl font-bold">{user?.usedMinutes || 0}</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <p className="text-sm font-medium text-muted-foreground">Max Minutes</p>
                            <p className="text-2xl font-bold">{user?.maxMinutes || 0}</p>
                        </div>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all"
                            style={{ width: `${Math.min(((user?.usedMinutes || 0) / (user?.maxMinutes || 1)) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                        {Math.round(((user?.usedMinutes || 0) / (user?.maxMinutes || 1)) * 100)}% used
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
