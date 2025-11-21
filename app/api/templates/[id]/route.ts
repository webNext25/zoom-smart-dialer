import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, category, provider, modelProvider, systemPrompt, firstMessage, isPublic } = body;

        const template = await prisma.template.update({
            where: { id: id },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(category && { category }),
                ...(provider && { provider }),
                ...(modelProvider && { modelProvider }),
                ...(systemPrompt && { systemPrompt }),
                ...(firstMessage && { firstMessage }),
                ...(isPublic !== undefined && { isPublic }),
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error("Error updating template:", error);
        return NextResponse.json(
            { error: "Failed to update template" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.template.delete({
            where: { id: id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting template:", error);
        return NextResponse.json(
            { error: "Failed to delete template" },
            { status: 500 }
        );
    }
}
