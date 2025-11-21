"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function AccountSettingsPage() {
    const { currentUser, users, updateUser } = useStore();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
        }
    }, [currentUser]);

    const handleSave = () => {
        if (currentUser) {
            updateUser(currentUser.id, { name });
            alert("Profile updated successfully!");
        }
    };

    if (!currentUser) return null;

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
                        <Input value={email} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
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
                            <p className="text-2xl font-bold">{currentUser.limits?.usedMinutes || 0}</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <p className="text-sm font-medium text-muted-foreground">Max Minutes</p>
                            <p className="text-2xl font-bold">{currentUser.limits?.maxMinutes || 0}</p>
                        </div>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all"
                            style={{ width: `${Math.min(((currentUser.limits?.usedMinutes || 0) / (currentUser.limits?.maxMinutes || 1)) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                        {Math.round(((currentUser.limits?.usedMinutes || 0) / (currentUser.limits?.maxMinutes || 1)) * 100)}% used
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
