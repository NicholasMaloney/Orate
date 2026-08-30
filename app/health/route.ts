import {
    errorResponse,
    successResponse,
} from "@/lib/api/responses";
import { getDatabase } from "@/lib/database/client";

// Prisma's PostgreSQL adapter requires the Node.js runtime.
export const runtime = "nodejs";

// A health result must always reflect the current database state.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
    try {
        const database = getDatabase();

        // Executes a minimal query to prove PostgreSQL is responding.
        await database.$queryRaw`SELECT 1`;

        return successResponse({
            status: "healthy",
            database: "connected",
        });
    } catch (error) {
        // The detailed failure stays in server logs.
        console.error(
            "Database health check failed.",
            error,
        );

        return errorResponse(
            "DATABASE_UNAVAILABLE",
            "PostgreSQL is unavailable.",
            503,
        );
    }
}