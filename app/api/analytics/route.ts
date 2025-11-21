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

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                recordings: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const totalCalls = user.recordings.length;
        const totalMinutes = user.usedMinutes;
        const averageDuration = totalCalls > 0
            ? Math.round(user.recordings.reduce((acc, r) => acc + r.duration, 0) / totalCalls)
            : 0;

        const sentimentCounts = user.recordings.reduce((acc, r) => {
            acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return NextResponse.json({
            totalCalls,
            totalMinutes,
            averageDuration,
            sentimentCounts,
            recentCalls: user.recordings.slice(0, 5),
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
