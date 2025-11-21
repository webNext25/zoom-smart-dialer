"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch data");
    }
    return res.json();
};

export default function AdminTemplatesPage() {
    const { data: templates, error, isLoading } = useSWR("/api/templates", fetcher);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "Sales",
        provider: "vapi",
        modelProvider: "openai",
        systemPrompt: "",
        firstMessage: "",
        isPublic: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : "/api/templates";
            const method = editingTemplate ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save template");

            toast.success(`Template ${editingTemplate ? "updated" : "created"} successfully`);
            setIsDialogOpen(false);
            setEditingTemplate(null);
            setFormData({
                name: "",
                description: "",
                category: "Sales",
                provider: "vapi",
                modelProvider: "openai",
                systemPrompt: "",
                firstMessage: "",
                isPublic: true,
            });
            mutate("/api/templates");
        } catch (error) {
            toast.error("Failed to save template");
        }
    };

    const handleEdit = (template: any) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            description: template.description,
            category: template.category,
            provider: template.provider || "vapi",
            modelProvider: template.modelProvider || "openai",
            systemPrompt: template.systemPrompt,
            firstMessage: template.firstMessage,
            isPublic: template.isPublic,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this template?")) {
            try {
                const res = await fetch(`/api/templates/${id}`, {
                    method: "DELETE",
                });
                if (!res.ok) throw new Error("Failed to delete");
                toast.success("Template deleted");
                mutate("/api/templates");
            } catch (error) {
                toast.error("Failed to delete template");
            }
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading templates</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingTemplate(null);
                        setFormData({
                            name: "",
                            description: "",
                            category: "Sales",
                            provider: "vapi",
                            modelProvider: "openai",
                            systemPrompt: "",
                            firstMessage: "",
                            isPublic: true,
                        });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>Add Template</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingTemplate ? "Edit Template" : "Add New Template"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sales">Sales</SelectItem>
                                            <SelectItem value="Support">Support</SelectItem>
                                            <SelectItem value="Scheduling">Scheduling</SelectItem>
                                            <SelectItem value="Research">Research</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
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
                            <div className="space-y-2">
                                <Label>System Prompt</Label>
                                <Textarea
                                    value={formData.systemPrompt}
                                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                    className="h-32"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>First Message</Label>
                                <Input
                                    value={formData.firstMessage}
                                    onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="isPublic">Publicly Available</Label>
                            </div>
                            <Button type="submit" className="w-full">
                                {editingTemplate ? "Update Template" : "Create Template"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Template Library</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(templates) && templates.map((template: any) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">{template.name}</TableCell>
                                    <TableCell>{template.category}</TableCell>
                                    <TableCell className="max-w-xs truncate">{template.description}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${template.isPublic ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {template.isPublic ? "Public" : "Draft"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
