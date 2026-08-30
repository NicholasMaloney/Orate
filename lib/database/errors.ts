import { Prisma } from "@/build/generated/prisma/client";

export type ExpectedPrismaErrorCode =
    | "P2002"  // unique constraint conflict, such as a duplicate list name.
    | "P2003"  // foreign-key restriction, such as a saved activity using the list.
    | "P2025"; // requested record does not exist.

// Identifies a known Prisma failure without relying on error messages.
export function hasPrismaErrorCode(
    error: unknown,
    code: ExpectedPrismaErrorCode,
): error is Prisma.PrismaClientKnownRequestError {
    return (
        error instanceof
            Prisma.PrismaClientKnownRequestError &&
        error.code === code
    );
}