import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Use a consistent encryption key from environment
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || "default-dev-key-change-in-production-32chars!!";

export class SettingsService {
    /**
     * Encrypt a value using AES-256-CBC
     */
    static encrypt(value: string): string {
        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            const iv = crypto.randomBytes(16);

            const cipher = crypto.createCipheriv(algorithm, key, iv);
            let encrypted = cipher.update(value, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Prepend IV to encrypted data (needed for decryption)
            return iv.toString('hex') + ':' + encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt value');
        }
    }

    /**
     * Decrypt a value using AES-256-CBC
     */
    static decrypt(encrypted: string): string {
        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

            const parts = encrypted.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encryptedData = parts[1];

            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt value');
        }
    }

    /**
     * Get a setting by key
     */
    static async get(key: string): Promise<string | null> {
        const setting = await prisma.systemSettings.findUnique({
            where: { key }
        });

        if (!setting) return null;

        try {
            return this.decrypt(setting.value);
        } catch {
            return null;
        }
    }

    /**
     * Set a setting (creates or updates)
     */
    static async set(key: string, value: string, category: string, isPublic: boolean, userId: string) {
        const encryptedValue = this.encrypt(value);

        return prisma.systemSettings.upsert({
            where: { key },
            create: {
                key,
                value: encryptedValue,
                category,
                isPublic,
                updatedBy: userId
            },
            update: {
                value: encryptedValue,
                updatedBy: userId,
                updatedAt: new Date()
            }
        });
    }

    /**
     * Get all settings (admin only - returns decrypted values)
     */
    static async getAll(): Promise<Record<string, any>> {
        const settings = await prisma.systemSettings.findMany();

        const result: Record<string, any> = {};

        for (const setting of settings) {
            try {
                const decrypted = this.decrypt(setting.value);

                // Group by category
                if (!result[setting.category]) {
                    result[setting.category] = {};
                }

                result[setting.category][setting.key] = {
                    value: decrypted,
                    isPublic: setting.isPublic,
                    updatedAt: setting.updatedAt
                };
            } catch (error) {
                console.error(`Failed to decrypt setting: ${setting.key}`);
            }
        }

        return result;
    }

    /**
     * Get all public settings (for client-side access)
     */
    static async getPublicSettings(): Promise<Record<string, string>> {
        const settings = await prisma.systemSettings.findMany({
            where: { isPublic: true }
        });

        const result: Record<string, string> = {};

        for (const setting of settings) {
            try {
                result[setting.key] = this.decrypt(setting.value);
            } catch (error) {
                console.error(`Failed to decrypt public setting: ${setting.key}`);
            }
        }

        return result;
    }

    /**
     * Delete a setting
     */
    static async delete(key: string) {
        return prisma.systemSettings.delete({
            where: { key }
        });
    }

    /**
     * Get settings by category
     */
    static async getByCategory(category: string) {
        const settings = await prisma.systemSettings.findMany({
            where: { category }
        });

        const result: Record<string, string> = {};

        for (const setting of settings) {
            try {
                result[setting.key] = this.decrypt(setting.value);
            } catch (error) {
                console.error(`Failed to decrypt setting: ${setting.key}`);
            }
        }

        return result;
    }
}
