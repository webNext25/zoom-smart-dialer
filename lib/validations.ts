import { z } from 'zod';

export const agentSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    systemPrompt: z.string().min(10, 'Prompt must be at least 10 characters'),
    firstMessage: z.string().min(1, 'First message is required'),
    voiceId: z.string().min(1, 'Voice selection is required'),
    modelProvider: z.enum(['openai', 'anthropic', 'google']),
    provider: z.string().default('vapi'),
});

export const userSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['ADMIN', 'CUSTOMER']).default('CUSTOMER'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const voiceSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    provider: z.string().min(1, 'Provider is required'),
    providerVoiceId: z.string().min(1, 'Voice ID is required'),
    isPublic: z.boolean().default(false),
});

export const knowledgeBaseSchema = z.object({
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileSize: z.number().positive(),
    fileType: z.string(),
});

export type AgentFormData = z.infer<typeof agentSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type VoiceFormData = z.infer<typeof voiceSchema>;
export type KnowledgeBaseFormData = z.infer<typeof knowledgeBaseSchema>;
