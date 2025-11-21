"use client";

import { useStore } from "@/lib/store";
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
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Voice } from "@/types";
import { Badge } from "lucide-react"; // Wait, Badge is a component, not icon. I need to create Badge or use something else.

export default function VoicesPage() {
    const { voices, addVoice, updateVoice } = useStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newVoice, setNewVoice] = useState<Partial<Voice>>({
        provider: "vapi",
        isPublic: true,
    });

    const handleAddVoice = () => {
        if (!newVoice.name || !newVoice.providerVoiceId) return;

        addVoice({
            id: `voice-${Date.now()}`,
            name: newVoice.name,
            provider: newVoice.provider as any,
            providerVoiceId: newVoice.providerVoiceId,
            isPublic: newVoice.isPublic || false,
            assignedTo: [],
        });
        setIsDialogOpen(false);
        setNewVoice({ provider: "vapi", isPublic: true });
    };

    const togglePublic = (voice: Voice) => {
        updateVoice(voice.id, { isPublic: !voice.isPublic });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Voices & Providers</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Voice</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Voice</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={newVoice.name || ""}
                                    onChange={(e) => setNewVoice({ ...newVoice, name: e.target.value })}
                                    placeholder="e.g. Rachel"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Provider</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={newVoice.provider}
                                    onChange={(e) => setNewVoice({ ...newVoice, provider: e.target.value as any })}
                                >
                                    <option value="vapi">Vapi</option>
                                    <option value="elevenlabs">ElevenLabs</option>
                                    <option value="openai">OpenAI</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Provider Voice ID</Label>
                                <Input
                                    value={newVoice.providerVoiceId || ""}
                                    onChange={(e) => setNewVoice({ ...newVoice, providerVoiceId: e.target.value })}
                                    placeholder="Provider specific ID"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={newVoice.isPublic}
                                    onChange={(e) => setNewVoice({ ...newVoice, isPublic: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="isPublic">Publicly Available</Label>
                            </div>
                        </div>
                        <Button onClick={handleAddVoice}>Save Voice</Button>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Voice Library</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Voice ID</TableHead>
                                <TableHead>Access</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {voices.map((voice) => (
                                <TableRow key={voice.id}>
                                    <TableCell className="font-medium">{voice.name}</TableCell>
                                    <TableCell className="capitalize">{voice.provider}</TableCell>
                                    <TableCell className="font-mono text-xs">{voice.providerVoiceId}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${voice.isPublic ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {voice.isPublic ? "Public" : "Restricted"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" onClick={() => togglePublic(voice)}>
                                            {voice.isPublic ? "Make Private" : "Make Public"}
                                        </Button>
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
