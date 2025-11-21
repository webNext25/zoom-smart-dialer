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
        const { name, provider, providerVoiceId, isPublic } = body;

        const voice = await prisma.voice.update({
            where: { id: id },
            data: {
                ...(name && { name }),
                ...(provider && { provider }),
                ...(providerVoiceId && { providerVoiceId }),
                ...(isPublic !== undefined && { isPublic }),
            },
        });

        return NextResponse.json(voice);
    } catch (error) {
        console.error("Error updating voice:", error);
        return NextResponse.json(
            { error: "Failed to update voice" },
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

        await prisma.voice.delete({
            where: { id: id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting voice:", error);
        return NextResponse.json(
            { error: "Failed to delete voice" },
            { status: 500 }
        );
    }
}
