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
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VoicesPage() {
    const { data: voices, error } = useSWR("/api/voices", fetcher);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newVoice, setNewVoice] = useState({
        name: "",
        provider: "vapi",
        providerVoiceId: "",
        isPublic: true,
    });

    const handleAddVoice = async () => {
        if (!newVoice.name || !newVoice.providerVoiceId) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            const res = await fetch("/api/voices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newVoice),
            });

            if (!res.ok) throw new Error("Failed to add voice");

            toast.success("Voice added successfully!");
            mutate("/api/voices");
            setIsDialogOpen(false);
            setNewVoice({ name: "", provider: "vapi", providerVoiceId: "", isPublic: true });
        } catch (error) {
            toast.error("Failed to add voice");
        }
    };

    if (error) return <div>Error loading voices</div>;
    if (!voices) return <div>Loading...</div>;

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
                                    value={newVoice.name}
                                    onChange={(e) => setNewVoice({ ...newVoice, name: e.target.value })}
                                    placeholder="e.g. Rachel"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Provider</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={newVoice.provider}
                                    onChange={(e) => setNewVoice({ ...newVoice, provider: e.target.value })}
                                >
                                    <option value="vapi">Vapi</option>
                                    <option value="elevenlabs">ElevenLabs</option>
                                    <option value="openai">OpenAI</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Provider Voice ID</Label>
                                <Input
                                    value={newVoice.providerVoiceId}
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
                    {voices.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No voices available. Add a voice to get started.
                        </p>
                    ) : (
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
                                {voices.map((voice: any) => (
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
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(`/api/voices/${voice.id}`, {
                                                                method: "PATCH",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ isPublic: !voice.isPublic }),
                                                            });
                                                            if (!res.ok) throw new Error("Failed to update");
                                                            toast.success("Voice updated");
                                                            mutate("/api/voices");
                                                        } catch (error) {
                                                            toast.error("Failed to update voice");
                                                        }
                                                    }}
                                                >
                                                    {voice.isPublic ? "Make Private" : "Make Public"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={async () => {
                                                        if (confirm(`Delete voice ${voice.name}?`)) {
                                                            try {
                                                                const res = await fetch(`/api/voices/${voice.id}`, {
                                                                    method: "DELETE",
                                                                });
                                                                if (!res.ok) throw new Error("Failed to delete");
                                                                toast.success("Voice deleted");
                                                                mutate("/api/voices");
                                                            } catch (error) {
                                                                toast.error("Failed to delete voice");
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
