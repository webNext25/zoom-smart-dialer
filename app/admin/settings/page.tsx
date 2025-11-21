"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Save, RefreshCw } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Setting {
    displayValue: string;
    isPublic: boolean;
    updatedAt: string;
}

export default function AdminSettingsPage() {
    const { data: settingsData, error, isLoading } = useSWR("/api/admin/settings", fetcher);
    const [settings, setSettings] = useState<Record<string, Record<string, Setting>>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settingsData) {
            setSettings(settingsData);
        }
    }, [settingsData]);

    const handleChange = (category: string, key: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: {
                    ...prev[category]?.[key],
                    displayValue: value
                }
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Flatten settings for API
            const settingsArray = [];
            for (const category in settings) {
                for (const key in settings[category]) {
                    const setting = settings[category][key];
                    // Only send if value has changed (not masked)
                    if (setting.displayValue && !setting.displayValue.includes('***')) {
                        settingsArray.push({
                            key,
                            value: setting.displayValue,
                            category,
                            isPublic: setting.isPublic
                        });
                    }
                }
            }

            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: settingsArray }),
            });

            if (!response.ok) {
                throw new Error("Failed to save settings");
            }

            toast.success("Settings saved successfully");
            mutate("/api/admin/settings");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <Skeleton className="h-10 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Error loading settings</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-muted-foreground mt-1">Configure API keys and integrations</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                    <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>Security Notice:</strong> All settings are encrypted in the database.
                            Masked values (***) indicate existing keys. To update, enter the full new value.
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="ai" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="ai">AI Providers</TabsTrigger>
                    <TabsTrigger value="voice">Voice Services</TabsTrigger>
                    <TabsTrigger value="zoom">Zoom Integration</TabsTrigger>
                    <TabsTrigger value="upload">File Storage</TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Model Providers</CardTitle>
                            <CardDescription>Configure API keys for LLM providers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>OpenAI API Key</Label>
                                <Input
                                    type="password"
                                    value={settings.ai?.["openai.apiKey"]?.displayValue || ""}
                                    onChange={(e) => handleChange("ai", "openai.apiKey", e.target.value)}
                                    placeholder="sk-..."
                                />
                                <p className="text-xs text-muted-foreground">Used for GPT models in agent configuration</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="voice" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vapi Voice AI</CardTitle>
                            <CardDescription>Configure Vapi for AI calling</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Vapi Public Key (Client-side)</Label>
                                <Input
                                    type="text"
                                    value={settings.voice?.["vapi.publicKey"]?.displayValue || ""}
                                    onChange={(e) => handleChange("voice", "vapi.publicKey", e.target.value)}
                                    placeholder="vapi_..."
                                />
                                <p className="text-xs text-muted-foreground">Public key for browser-based calls</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Vapi Private Key (Server-side)</Label>
                                <Input
                                    type="password"
                                    value={settings.voice?.["vapi.privateKey"]?.displayValue || ""}
                                    onChange={(e) => handleChange("voice", "vapi.privateKey", e.target.value)}
                                    placeholder="sk_..."
                                />
                                <p className="text-xs text-muted-foreground">Private key for server operations</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>ElevenLabs Voice</CardTitle>
                            <CardDescription>Configure ElevenLabs for voice synthesis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>API Key</Label>
                                <Input
                                    type="password"
                                    value={settings.voice?.["elevenlabs.apiKey"]?.displayValue || ""}
                                    onChange={(e) => handleChange("voice", "elevenlabs.apiKey", e.target.value)}
                                    placeholder="..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Default Voice ID</Label>
                                <Input
                                    type="text"
                                    value={settings.voice?.["elevenlabs.defaultVoiceId"]?.displayValue || ""}
                                    onChange={(e) => handleChange("voice", "elevenlabs.defaultVoiceId", e.target.value)}
                                    placeholder="bIHbv24MWmeRgasZH58o"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="zoom" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Zoom OAuth</CardTitle>
                            <CardDescription>Configure Zoom Phone integration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Client ID</Label>
                                <Input
                                    type="text"
                                    value={settings.zoom?.["zoom.clientId"]?.displayValue || ""}
                                    onChange={(e) => handleChange("zoom", "zoom.clientId", e.target.value)}
                                    placeholder="Zoom Client ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Client Secret</Label>
                                <Input
                                    type="password"
                                    value={settings.zoom?.["zoom.clientSecret"]?.displayValue || ""}
                                    onChange={(e) => handleChange("zoom", "zoom.clientSecret", e.target.value)}
                                    placeholder="Zoom Client Secret"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Zoom Video SDK</CardTitle>
                            <CardDescription>Configure Zoom Video SDK for dialer</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>SDK Key</Label>
                                <Input
                                    type="text"
                                    value={settings.zoom?.["zoom.sdkKey"]?.displayValue || ""}
                                    onChange={(e) => handleChange("zoom", "zoom.sdkKey", e.target.value)}
                                    placeholder="SDK Key"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>SDK Secret</Label>
                                <Input
                                    type="password"
                                    value={settings.zoom?.["zoom.sdkSecret"]?.displayValue || ""}
                                    onChange={(e) => handleChange("zoom", "zoom.sdkSecret", e.target.value)}
                                    placeholder="SDK Secret"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>UploadThing</CardTitle>
                            <CardDescription>Configure file upload service</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Secret</Label>
                                <Input
                                    type="password"
                                    value={settings.upload?.["uploadthing.secret"]?.displayValue || ""}
                                    onChange={(e) => handleChange("upload", "uploadthing.secret", e.target.value)}
                                    placeholder="UploadThing Secret"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>App ID</Label>
                                <Input
                                    type="text"
                                    value={settings.upload?.["uploadthing.appId"]?.displayValue || ""}
                                    onChange={(e) => handleChange("upload", "uploadthing.appId", e.target.value)}
                                    placeholder="App ID"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
