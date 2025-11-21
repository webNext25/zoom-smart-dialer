"use client";

import { useStore } from "@/lib/store";
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
import { Agent } from "@/types";
import { Upload, FileText } from "lucide-react";

export default function AgentSettingsPage() {
    const { currentUser, agents, voices, addAgent, updateAgent } = useStore();
    const [agent, setAgent] = useState<Partial<Agent>>({
        name: "My AI Assistant",
        provider: "vapi",
        modelProvider: "openai",
        systemPrompt: "You are a helpful assistant.",
        firstMessage: "Hello! How can I help you today?",
        voiceId: "",
    });

    // Load existing agent if any
    useEffect(() => {
        if (currentUser) {
            const existingAgent = agents.find(a => a.userId === currentUser.id);
            if (existingAgent) {
                setAgent(existingAgent);
            }
        }
    }, [currentUser, agents]);

    const availableVoices = voices.filter(
        (v) => v.isPublic || (currentUser && v.assignedTo?.includes(currentUser.id))
    );

    const handleSave = () => {
        if (!currentUser) return;

        const agentData = {
            ...agent,
            userId: currentUser.id,
            id: agent.id || `agent-${Date.now()}`,
        } as Agent;

        if (agent.id) {
            updateAgent(agent.id, agentData);
        } else {
            addAgent(agentData);
        }
        alert("Agent settings saved!");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Agent Configuration</h2>
                <Button onClick={handleSave}>Save Changes</Button>
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
                                    value={agent.name}
                                    onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Voice</Label>
                                <Select
                                    value={agent.voiceId}
                                    onValueChange={(value) => setAgent({ ...agent, voiceId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a voice" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableVoices.map((voice) => (
                                            <SelectItem key={voice.id} value={voice.id}>
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
                                    value={agent.provider}
                                    onValueChange={(value) => setAgent({ ...agent, provider: value as any })}
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
                                    value={agent.modelProvider}
                                    onValueChange={(value) => setAgent({ ...agent, modelProvider: value as any })}
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
                                value={agent.systemPrompt}
                                onChange={(e) => setAgent({ ...agent, systemPrompt: e.target.value })}
                                placeholder="You are a helpful assistant..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>First Message</Label>
                            <Input
                                value={agent.firstMessage}
                                onChange={(e) => setAgent({ ...agent, firstMessage: e.target.value })}
                                placeholder="Hello! How can I help you?"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Knowledge Base</Label>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        const newFile = { id: `file-${Date.now()}`, name: `document-${Math.floor(Math.random() * 100)}.pdf`, type: "file" as const, url: "#" };
                                        // In a real app, this would be an upload handler
                                        setAgent(prev => ({
                                            ...prev,
                                            knowledgeBase: [...(prev.knowledgeBase || []), newFile]
                                        }));
                                    }}
                                >
                                    <Upload className="h-8 w-8 mb-2" />
                                    <p className="text-sm font-medium">Click to upload files or drag and drop</p>
                                    <p className="text-xs">PDF, TXT, DOCX up to 10MB</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            const url = prompt("Enter Google Doc URL:");
                                            if (url) {
                                                const newDoc = { id: `doc-${Date.now()}`, name: "Google Doc", type: "gdoc" as const, url };
                                                setAgent(prev => ({
                                                    ...prev,
                                                    knowledgeBase: [...(prev.knowledgeBase || []), newDoc]
                                                }));
                                            }
                                        }}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Add Google Doc Link
                                    </Button>
                                </div>

                                {agent.knowledgeBase && agent.knowledgeBase.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Attached Files</Label>
                                        {agent.knowledgeBase.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-destructive"
                                                    onClick={() => {
                                                        setAgent(prev => ({
                                                            ...prev,
                                                            knowledgeBase: prev.knowledgeBase?.filter(f => f.id !== file.id)
                                                        }));
                                                    }}
                                                >
                                                    &times;
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
