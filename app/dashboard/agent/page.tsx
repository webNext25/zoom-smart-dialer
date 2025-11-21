"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { Upload, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AgentSettingsPage() {
    const { data: agents, error: agentsError, isLoading: agentsLoading } = useSWR("/api/agents", fetcher);
    const { data: voices, error: voicesError } = useSWR("/api/voices", fetcher);

    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: "My AI Assistant",
        provider: "vapi",
        modelProvider: "openai",
        systemPrompt: "You are a helpful assistant.",
        firstMessage: "Hello! How can I help you today?",
        voiceId: "",
    });

    // Reset form when switching agents or creating new
    useEffect(() => {
        if (selectedAgentId && agents) {
            const agent = agents.find((a: any) => a.id === selectedAgentId);
            if (agent) {
                setFormData({
                    name: agent.name,
                    provider: agent.provider,
                    modelProvider: agent.modelProvider,
                    systemPrompt: agent.systemPrompt,
                    firstMessage: agent.firstMessage,
                    voiceId: agent.voiceId || "",
                });
            }
        } else if (isCreating) {
            setFormData({
                name: "My AI Assistant",
                provider: "vapi",
                modelProvider: "openai",
                systemPrompt: "You are a helpful assistant.",
                firstMessage: "Hello! How can I help you today?",
                voiceId: "",
            });
        }
    }, [selectedAgentId, isCreating, agents]);

    const handleSave = async () => {
        try {
            const method = selectedAgentId ? "PATCH" : "POST";
            const url = selectedAgentId ? `/api/agents/${selectedAgentId}` : "/api/agents";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save agent");

            const savedAgent = await res.json();
            toast.success("Agent saved successfully!");
            mutate("/api/agents");

            if (isCreating) {
                setIsCreating(false);
                setSelectedAgentId(savedAgent.id);
            }
        } catch (error) {
            toast.error("Failed to save agent");
        }
    };

    const handleDelete = async () => {
        if (!selectedAgentId || !confirm("Are you sure you want to delete this agent?")) return;

        try {
            const res = await fetch(`/api/agents/${selectedAgentId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete agent");

            toast.success("Agent deleted");
            mutate("/api/agents");
            setSelectedAgentId(null);
        } catch (error) {
            toast.error("Failed to delete agent");
        }
    };

    if (agentsError || voicesError) return <div>Error loading data</div>;

    // Loading state
    if (agentsLoading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // List View
    if (!selectedAgentId && !isCreating) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">My Agents</h2>
                        <p className="text-muted-foreground">Manage your AI phone agents</p>
                    </div>
                    <Button onClick={() => setIsCreating(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Agent
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {agents?.map((agent: any) => (
                        <Card
                            key={agent.id}
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setSelectedAgentId(agent.id)}
                        >
                            <CardHeader>
                                <CardTitle>{agent.name}</CardTitle>
                                <CardDescription>{agent.provider} • {agent.modelProvider}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {agent.systemPrompt}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                    {agents?.length === 0 && (
                        <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                            No agents found. Create one to get started!
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Edit/Create View
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedAgentId(null);
                        setIsCreating(false);
                    }}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isCreating ? "Create New Agent" : "Edit Agent"}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    {!isCreating && (
                        <Button variant="destructive" size="icon" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure the core personality and voice of your agent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Agent Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Voice</Label>
                                <Select
                                    value={formData.voiceId}
                                    onValueChange={(value) => setFormData({ ...formData, voiceId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a voice" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {voices?.map((voice: any) => (
                                            <SelectItem key={voice.id} value={voice.providerVoiceId}>
                                                {voice.name} ({voice.provider})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Provider</Label>
                                <Select
                                    value={formData.provider}
                                    onValueChange={(value) => setFormData({ ...formData, provider: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vapi">Vapi</SelectItem>
                                        <SelectItem value="retell">Retell AI</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select
                                    value={formData.modelProvider}
                                    onValueChange={(value) => setFormData({ ...formData, modelProvider: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                                        <SelectItem value="anthropic">Anthropic (Claude 3.5)</SelectItem>
                                        <SelectItem value="groq">Groq (Llama 3)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Behavior & Knowledge</CardTitle>
                        <CardDescription>Define how your agent speaks and what it knows.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>System Prompt</Label>
                            <Textarea
                                className="min-h-[150px] font-mono text-sm"
                                value={formData.systemPrompt}
                                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                placeholder="You are a helpful assistant..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>First Message</Label>
                            <Input
                                value={formData.firstMessage}
                                onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
                                placeholder="Hello! How can I help you?"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Knowledge Base</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground">
                                <Upload className="h-8 w-8 mb-2" />
                                <p className="text-sm font-medium">Knowledge Base Upload (Coming Soon)</p>
                                <p className="text-xs">File upload will be enabled once you add your API keys</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
