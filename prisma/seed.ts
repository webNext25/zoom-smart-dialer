import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            maxMinutes: 10000,
            usedMinutes: 0,
        },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create customer user
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            name: 'Test Customer',
            password: hashedPassword,
            role: 'CUSTOMER',
            maxMinutes: 100,
            usedMinutes: 25,
        },
    });
    console.log('✅ Created customer user:', customer.email);

    // Create voices
    const voices = await prisma.voice.createMany({
        data: [
            {
                name: 'Rachel - Professional',
                provider: 'elevenlabs',
                providerVoiceId: 'bIHbv24MWmeRgasZH58o',
                isPublic: true,
            },
            {
                name: 'Michael - Friendly',
                provider: 'elevenlabs',
                providerVoiceId: 'flq6f7yk4E4fJM5XTYuZ',
                isPublic: true,
            },
            {
                name: 'Sophia - Energetic',
                provider: 'elevenlabs',
                providerVoiceId: 'pNInz6obpgDQGcFmaJgB',
                isPublic: true,
            },
            {
                name: 'Josh - Casual',
                provider: 'openai',
                providerVoiceId: 'alloy',
                isPublic: true,
            },
        ],
        skipDuplicates: true,
    });
    console.log(`✅ Created ${voices.count} voices`);

    // Create sample agent for customer
    const agent = await prisma.agent.create({
        data: {
            userId: customer.id,
            name: 'Sales Assistant',
            provider: 'vapi',
            modelProvider: 'openai',
            systemPrompt: 'You are a helpful sales assistant. Your goal is to qualify leads and schedule demos.',
            firstMessage: 'Hi, this is Alex from Acme Corp. How can I help you today?',
            voiceId: 'bIHbv24MWmeRgasZH58o',
        },
    });
    console.log('✅ Created sample agent:', agent.name);

    // Create sample call recording
    await prisma.callRecording.create({
        data: {
            userId: customer.id,
            phoneNumber: '+1 (555) 123-4567',
            duration: 765, // 12:45 in seconds
            sentiment: 'positive',
            transcript: 'Agent: Hi, this is Alex from Acme Corp. How can I help you today?\nCustomer: I\'m interested in learning more about your product.',
            highlights: [
                { time: '02:15', text: 'Key Decision Point: Customer expressed budget concerns' },
                { time: '05:30', text: 'Objection Handled: Competitor comparison resolved' },
                { time: '10:20', text: 'Action Item: Follow-up meeting scheduled for next week' },
            ],
            audioUrl: null,
        },
    });
    console.log('✅ Created sample call recording');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('  Admin:    admin@example.com / password123');
    console.log('  Customer: customer@example.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
