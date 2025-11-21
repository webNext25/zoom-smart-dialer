import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { agentSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // Admin can see all agents, customers only their own
        const where = session.user.role === "ADMIN" && userId
            ? { userId }
            : { userId: session.user.id };

        const agents = await prisma.agent.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                knowledgeBase: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(agents);
    } catch (error) {
        console.error("Error fetching agents:", error);
        return NextResponse.json(
            { error: "Failed to fetch agents" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = agentSchema.parse(body);

        const agent = await prisma.agent.create({
            data: {
                ...validatedData,
                userId: session.user.id,
            },
            include: {
                knowledgeBase: true,
            },
        });

        return NextResponse.json(agent, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Error creating agent:", error);
        return NextResponse.json(
            { error: "Failed to create agent" },
            { status: 500 }
        );
    }
}
