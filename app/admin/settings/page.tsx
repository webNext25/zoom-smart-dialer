"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminSettingsPage() {
    const [apiKeys, setApiKeys] = useState({
        openai: "sk-...",
        anthropic: "sk-ant-...",
        vapi: "vapi-...",
        zoomClientId: "...",
        zoomClientSecret: "...",
    });

    const handleSave = () => {
        alert("Global settings saved!");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Global Settings</h2>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>LLM Providers</CardTitle>
                    <CardDescription>Configure API keys for AI model providers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>OpenAI API Key</Label>
                        <Input
                            type="password"
                            value={apiKeys.openai}
                            onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Anthropic API Key</Label>
                        <Input
                            type="password"
                            value={apiKeys.anthropic}
                            onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Voice Providers</CardTitle>
                    <CardDescription>Configure API keys for Voice generation services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Vapi Private Key</Label>
                        <Input
                            type="password"
                            value={apiKeys.vapi}
                            onChange={(e) => setApiKeys({ ...apiKeys, vapi: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Zoom Integration</CardTitle>
                    <CardDescription>Configure Zoom OAuth and SDK credentials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Zoom Client ID</Label>
                        <Input
                            value={apiKeys.zoomClientId}
                            onChange={(e) => setApiKeys({ ...apiKeys, zoomClientId: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Zoom Client Secret</Label>
                        <Input
                            type="password"
                            value={apiKeys.zoomClientSecret}
                            onChange={(e) => setApiKeys({ ...apiKeys, zoomClientSecret: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
