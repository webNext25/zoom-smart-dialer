import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Agent, Voice, AppState } from '@/types';

interface Store extends AppState {
    // Actions
    setCurrentUser: (user: User | null) => void;
    addUser: (user: User) => void;
    updateUser: (id: string, data: Partial<User>) => void;
    addAgent: (agent: Agent) => void;
    updateAgent: (id: string, data: Partial<Agent>) => void;
    deleteAgent: (id: string) => void;
    addVoice: (voice: Voice) => void;
    updateVoice: (id: string, data: Partial<Voice>) => void;
}

const INITIAL_USERS: User[] = [
    {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        limits: { maxMinutes: 10000, usedMinutes: 0 }
    },
    {
        id: 'customer-1',
        name: 'John Doe',
        email: 'customer@example.com',
        role: 'customer',
        limits: { maxMinutes: 100, usedMinutes: 10 }
    }
];

const INITIAL_VOICES: Voice[] = [
    {
        id: 'voice-1',
        name: 'Rachel',
        provider: 'vapi',
        providerVoiceId: 'rachel-voice-id',
        isPublic: true,
    },
    {
        id: 'voice-2',
        name: 'Drew',
        provider: 'vapi',
        providerVoiceId: 'drew-voice-id',
        isPublic: true,
    },
    {
        id: 'voice-3',
        name: 'Private Voice',
        provider: 'elevenlabs',
        providerVoiceId: 'private-id',
        isPublic: false,
        assignedTo: ['customer-1']
    }
];

export const useStore = create<Store>()(
    persist(
        (set) => ({
            currentUser: null,
            users: INITIAL_USERS,
            voices: INITIAL_VOICES,
            agents: [],
            isLoading: false,

            setCurrentUser: (user) => set({ currentUser: user }),
            addUser: (user) => set((state) => ({ users: [...state.users, user] })),
            updateUser: (id, data) => set((state) => ({
                users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u))
            })),
            addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
            updateAgent: (id, data) => set((state) => ({
                agents: state.agents.map((a) => (a.id === id ? { ...a, ...data } : a))
            })),
            deleteAgent: (id) => set((state) => ({
                agents: state.agents.filter((a) => a.id !== id)
            })),
            addVoice: (voice) => set((state) => ({ voices: [...state.voices, voice] })),
            updateVoice: (id, data) => set((state) => ({
                voices: state.voices.map((v) => (v.id === id ? { ...v, ...data } : v))
            })),
        }),
        {
            name: 'zoom-dialer-storage',
        }
    )
);
