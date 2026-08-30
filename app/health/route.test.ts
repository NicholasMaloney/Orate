import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const databaseMocks = vi.hoisted(() => ({
    getDatabase: vi.fn(),
    queryRaw: vi.fn(),
}));

vi.mock("@/lib/database/client", () => ({
    getDatabase: databaseMocks.getDatabase,
}));

import { GET } from "@/app/health/route";

describe("GET /health", () => {
    beforeEach(() => {
        databaseMocks.getDatabase.mockReset();
        databaseMocks.queryRaw.mockReset();

        databaseMocks.getDatabase.mockReturnValue({
            $queryRaw: databaseMocks.queryRaw,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns 200 when PostgreSQL responds", async () => {
        databaseMocks.queryRaw.mockResolvedValue([
            { connected: 1 },
        ]);

        const response = await GET();

        expect(databaseMocks.getDatabase)
            .toHaveBeenCalledOnce();

        expect(databaseMocks.queryRaw)
            .toHaveBeenCalledOnce();

        expect(response.status).toBe(200);

        await expect(response.json()).resolves.toEqual({
            data: {
                status: "healthy",
                database: "connected",
            },
        });
    });

    it("returns 503 without exposing the database error", async () => {
        const databaseError =
            new Error("Connection refused");

        databaseMocks.queryRaw.mockRejectedValue(
            databaseError,
        );

        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const response = await GET();

        expect(response.status).toBe(503);

        await expect(response.json()).resolves.toEqual({
            error: {
                code: "DATABASE_UNAVAILABLE",
                message: "PostgreSQL is unavailable.",
            },
        });

        expect(consoleError).toHaveBeenCalledWith(
            "Database health check failed.",
            databaseError,
        );
    });
});