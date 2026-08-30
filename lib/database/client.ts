import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/build/generated/prisma/client";

// Preserves the client when Next.js reloads server modules during development.
const globalForDatabase = globalThis as typeof globalThis & {
    orateDatabaseClient?: PrismaClient;
};

let databaseClient =
    globalForDatabase.orateDatabaseClient;

// Creates the Prisma client only when a request first needs the database.
export function getDatabase(): PrismaClient {
    if (databaseClient) {
        return databaseClient;
    }

    const connectionString =
        process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            "DATABASE_URL is required to connect to PostgreSQL.",
        );
    }

    const adapter = new PrismaPg({
        connectionString,
    });

    databaseClient = new PrismaClient({
        adapter,
    });

    // Hot reloads reuse the same pool instead of opening extra connections.
    if (process.env.NODE_ENV !== "production") {
        globalForDatabase.orateDatabaseClient =
            databaseClient;
    }

    return databaseClient;
}