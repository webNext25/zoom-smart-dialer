"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Download, Search, Star, Clock, Calendar, User } from "lucide-react";

const mockRecordings = [
    {
        id: "rec-1",
        date: "2025-11-20",
        time: "14:30",
        duration: "12:45",
        customer: "+1 (555) 123-4567",
        agent: "Sales Bot",
        sentiment: "positive",
        highlights: [
            { time: "02:15", text: "Key Decision Point: Customer expressed budget concerns" },
            { time: "05:30", text: "Objection Handled: Competitor comparison resolved" },
            { time: "10:20", text: "Action Item: Follow-up meeting scheduled for next week" },
        ],
        transcript: "Full transcript would be here...",
        audioUrl: "#",
    },
    {
        id: "rec-2",
        date: "2025-11-20",
        time: "11:15",
        duration: "8:22",
        customer: "+1 (555) 987-6543",
        agent: "Support Bot",
        sentiment: "neutral",
        highlights: [
            { time: "01:45", text: "Issue Identified: Password reset needed" },
            { time: "04:10", text: "Resolution: Account access restored" },
        ],
        transcript: "Full transcript would be here...",
        audioUrl: "#",
    },
    {
        id: "rec-3",
        date: "2025-11-19",
        time: "16:00",
        duration: "15:30",
        customer: "+1 (555) 456-7890",
        agent: "Sales Bot",
        sentiment: "positive",
        highlights: [
            { time: "03:00", text: "Key Decision Point: Customer asked about enterprise plan" },
            { time: "08:45", text: "Success: Deal closed for $5,000 MRR" },
            { time: "12:00", text: "Action Item: Onboarding call scheduled" },
        ],
        transcript: "Full transcript would be here...",
        audioUrl: "#",
    },
];

export default function RecordingsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRecording, setSelectedRecording] = useState(mockRecordings[0]);
    const [isPlaying, setIsPlaying] = useState(false);

    const filteredRecordings = mockRecordings.filter(rec =>
        rec.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.agent.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Call Recordings</h2>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search recordings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                    <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Recordings List */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Recordings</CardTitle>
                        <CardDescription>{filteredRecordings.length} recordings found</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px]">
                            <div className="divide-y">
                                {filteredRecordings.map((recording) => (
                                    <div
                                        key={recording.id}
                                        className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedRecording.id === recording.id ? "bg-muted" : ""
                                            }`}
                                        onClick={() => setSelectedRecording(recording)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">{recording.date}</span>
                                            </div>
                                            <Badge
                                                variant={
                                                    recording.sentiment === "positive"
                                                        ? "default"
                                                        : recording.sentiment === "neutral"
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                                className="text-xs"
                                            >
                                                {recording.sentiment}
                                            </Badge>
                                        </div>
                                        <p className="font-medium text-sm mb-1">{recording.customer}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {recording.duration}
                                            <span>•</span>
                                            <span>{recording.agent}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Recording Details & Player */}
                <div className="col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Recording Details</CardTitle>
                                    <CardDescription>
                                        {selectedRecording.date} at {selectedRecording.time}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Audio Player */}
                            <div className="bg-muted/50 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{selectedRecording.customer}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{selectedRecording.duration}</span>
                                </div>

                                {/* Waveform Placeholder */}
                                <div className="h-16 bg-primary/10 rounded-md mb-4 flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">Audio Waveform</span>
                                </div>

                                {/* Player Controls */}
                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>
                                    <div className="flex-1 bg-secondary h-1 rounded-full">
                                        <div className="bg-primary h-full w-1/3 rounded-full"></div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">02:15 / {selectedRecording.duration}</span>
                                </div>
                            </div>

                            {/* Call Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/50 rounded-md">
                                    <p className="text-xs text-muted-foreground mb-1">Agent</p>
                                    <p className="font-medium">{selectedRecording.agent}</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-md">
                                    <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
                                    <Badge
                                        variant={
                                            selectedRecording.sentiment === "positive"
                                                ? "default"
                                                : selectedRecording.sentiment === "neutral"
                                                    ? "secondary"
                                                    : "destructive"
                                        }
                                    >
                                        {selectedRecording.sentiment.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI-Generated Highlights */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                AI-Generated Highlights
                            </CardTitle>
                            <CardDescription>Key moments and action items from this call</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {selectedRecording.highlights.map((highlight, i) => (
                                    <div key={i} className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                        <div className="flex-shrink-0">
                                            <div className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium">
                                                {highlight.time}
                                            </div>
                                        </div>
                                        <p className="text-sm">{highlight.text}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
