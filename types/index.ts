export type Role = 'admin' | 'customer';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
    limits?: UserLimits;
}

export interface UserLimits {
    maxMinutes: number;
    usedMinutes: number;
}

export interface Voice {
    id: string;
    name: string;
    provider: 'vapi' | 'elevenlabs' | 'openai';
    providerVoiceId: string;
    previewUrl?: string;
    isPublic: boolean; // If true, available to all. If false, must be assigned.
    assignedTo?: string[]; // Array of User IDs
}

export interface Agent {
    id: string;
    userId: string;
    name: string;
    provider: 'vapi' | 'retell'; // The platform running the agent
    modelProvider: 'openai' | 'anthropic' | 'groq';
    systemPrompt: string;
    firstMessage: string;
    voiceId: string; // References Voice.id
    knowledgeBase?: KnowledgeBaseFile[];
}

export interface KnowledgeBaseFile {
    id: string;
    name: string;
    url: string;
    type: 'file' | 'gdoc';
}

export interface AppState {
    currentUser: User | null;
    users: User[];
    voices: Voice[];
    agents: Agent[];
    isLoading: boolean;
}
