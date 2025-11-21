"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Star, Copy, Loader2 } from "lucide-react";
import useSWR from "swr";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch data");
    }
    return res.json();
};

export default function TemplatesPage() {
    const { data: templates, error, isLoading } = useSWR("/api/templates", fetcher);
    const router = useRouter();
    const [creatingId, setCreatingId] = useState<string | null>(null);

    const handleUseTemplate = async (template: any) => {
        setCreatingId(template.id);
        try {
            // Create a new agent based on the template
            const res = await fetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: template.name,
                    provider: template.provider || "vapi",
                    modelProvider: template.modelProvider || "openai",
                    systemPrompt: template.systemPrompt,
                    firstMessage: template.firstMessage,
                    voiceId: "", // User will select voice later
                }),
            });

            if (!res.ok) throw new Error("Failed to create agent");

            const agent = await res.json();
            toast.success("Agent created from template!");
            router.push(`/dashboard/agent?id=${agent.id}`);
        } catch (error) {
            toast.error("Failed to use template");
        } finally {
            setCreatingId(null);
        }
    };

    if (error) return <div className="text-center py-12">Error loading templates</div>;

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6 max-w-6xl mx-auto">
                <div>
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-96 mt-2" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-20 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-16 w-full mb-4" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agent Templates</h2>
                    <p className="text-muted-foreground">
                        Pre-configured AI agents for common use cases
                    </p>
                </div>
            </div>

            {!Array.isArray(templates) || templates.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No templates available yet. Check back later!
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template: any) => (
                        <Card key={template.id} className="flex flex-col relative overflow-hidden">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="mb-2">{template.category}</Badge>
                                </div>
                                <CardTitle className="text-xl">{template.name}</CardTitle>
                                <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">System Prompt:</span>
                                    <p className="line-clamp-3 mt-1 italic">"{template.systemPrompt}"</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => handleUseTemplate(template)}
                                    disabled={creatingId === template.id}
                                >
                                    {creatingId === template.id ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Agent...
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Use Template
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
