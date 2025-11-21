import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Build where clause based on role
        const where: any = {};

        // Non-admin users can only see public templates
        if (session.user.role !== "ADMIN") {
            where.isPublic = true;
        }
        // Admin sees all templates (no filter)

        const templates = await prisma.template.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json(
            { error: "Failed to fetch templates" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, category, provider, modelProvider, systemPrompt, firstMessage, isPublic } = body;

        if (!name || !description || !category || !systemPrompt || !firstMessage) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const template = await prisma.template.create({
            data: {
                name,
                description,
                category,
                provider: provider || "vapi",
                modelProvider: modelProvider || "openai",
                systemPrompt,
                firstMessage,
                isPublic: isPublic !== undefined ? isPublic : true,
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error("Error creating template:", error);
        return NextResponse.json(
            { error: "Failed to create template" },
            { status: 500 }
        );
    }
}
