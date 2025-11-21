"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { Agent } from "@/types";
import { ShoppingBag, Star, Check, Copy } from "lucide-react";

const templates = [
    {
        id: "temp-1",
        name: "SaaS Sales Qualifier",
        description: "Expert at qualifying inbound leads for B2B SaaS products. Asks BANT questions.",
        tags: ["Sales", "Inbound", "B2B"],
        rating: 4.8,
        users: 1200,
        systemPrompt: "You are a senior SDR for a B2B SaaS company. Your goal is to qualify leads using the BANT framework...",
        firstMessage: "Hi, this is Alex from Acme Corp. I saw you requested a demo, do you have a moment?",
    },
    {
        id: "temp-2",
        name: "Customer Support Tier 1",
        description: "Handles common support queries, resets passwords, and triages complex issues.",
        tags: ["Support", "Service", "24/7"],
        rating: 4.6,
        users: 3400,
        systemPrompt: "You are a helpful support agent. You can help with password resets, billing inquiries, and general troubleshooting...",
        firstMessage: "Thank you for calling Support. How can I assist you today?",
    },
    {
        id: "temp-3",
        name: "Real Estate Appointment Setter",
        description: "Follows up with Zillow/Redfin leads to book viewing appointments for agents.",
        tags: ["Real Estate", "Scheduling", "Outbound"],
        rating: 4.9,
        users: 850,
        systemPrompt: "You are an assistant for a top real estate agent. Your goal is to get the lead to agree to a viewing time...",
        firstMessage: "Hi, I'm calling regarding the property you viewed on Zillow. Are you still interested in taking a look?",
    },
    {
        id: "temp-4",
        name: "Medical Intake Assistant",
        description: "Collects patient history and insurance information before the doctor's visit.",
        tags: ["Healthcare", "HIPAA", "Intake"],
        rating: 4.7,
        users: 500,
        systemPrompt: "You are a medical intake assistant. Please collect the patient's name, DOB, and reason for visit...",
        firstMessage: "Hello, I'm the intake assistant for Dr. Smith. Could I get your full name and date of birth please?",
    },
];

export default function TemplatesPage() {
    const { currentUser, addAgent } = useStore();

    const handleUseTemplate = (template: any) => {
        if (!currentUser) return;

        const newAgent: Agent = {
            id: `agent-${Date.now()}`,
            userId: currentUser.id,
            name: `${template.name} (Copy)`,
            provider: "vapi",
            modelProvider: "openai",
            systemPrompt: template.systemPrompt,
            firstMessage: template.firstMessage,
            voiceId: "", // User needs to select voice
        };

        addAgent(newAgent);
        alert(`Template "${template.name}" added to your agents!`);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agent Marketplace</h2>
                    <p className="text-muted-foreground">Browse and deploy pre-built, high-performance agent templates.</p>
                </div>
                <Button variant="outline">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Purchased Templates
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="mb-2">{template.tags[0]}</Badge>
                                <div className="flex items-center text-yellow-500 text-sm">
                                    <Star className="h-3 w-3 fill-current mr-1" />
                                    {template.rating}
                                </div>
                            </div>
                            <CardTitle className="text-xl">{template.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {template.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{template.users}+</span> users deployed this
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleUseTemplate(template)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Use Template
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
