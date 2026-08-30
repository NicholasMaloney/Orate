import { z } from "zod";
import {
    errorResponse,
    type ApiErrorDetail,
} from "@/lib/api/responses"; 

const POSTGRES_INTEGER_MINIMUM = -2_147_483_648;
const POSTGRES_INTEGER_MAXIMUM = 2_147_483_647;

// Creates a trimmed, required text field with a database-safe limit.
function requiredText(
    fieldName: string,
    maximumLength: number,
) {
    return z
        .string()
        .trim()
        .min(1, `${fieldName} is required.`)
        .max(maximumLength, `${fieldName} must contain no more than ${maximumLength} characters.`,);
}

// Update operations must change at least one resource field.
function containsAtLeastOneField(
    value: object,
): boolean {
    return Object.keys(value).length > 0;
}

export const uuidSchema = z 
    .string()
    .uuid("A valid UUID is required.");

export const difficultySchema = z.enum([
    "easy",
    "standard",
    "challenging",
]); 

const descriptionSchema = z
    .string()
    .trim()
    .max(
        500,
        "Description must contain no more than 500 characters.",
    )
    .nullable()
    .optional();

export const createWordListSchema = z
    .object({
        name: requiredText("Name", 100),
        description: descriptionSchema,
    })
    .strict();

export const updateWordListSchema = 
    createWordListSchema
        .partial()
        .refine(containsAtLeastOneField, {
            message: "Provide at least one field to update.",
        });

export const phonemeInputSchema = z 
    .object({
        ipaSymbol: requiredText("IPA symbol", 20),
        grapheme: requiredText("Grapheme", 30),
        exampleWord: requiredText("Example word", 100),
        spokenName: requiredText("Spoken name", 100),
    })
    .strict(); 

export const createWordSchema = z
    .object({
        english: requiredText("English word", 100),
        ipa: requiredText("IPA transcription", 200),
        // Array order becomes each phoneme's database position.
        phonemes: z
            .array(phonemeInputSchema)
            .min(1, "At least one phoneme is required.")
            .max(
                30,
                "A word cannot contain more than 30 phonemes.",
            ),
    })
    .strict();

export const updateWordSchema =
    createWordSchema
        .partial()
        .refine(containsAtLeastOneField, {
            message: "Provide at least one field to update.",
        });

export const createWordleConfigurationSchema = z
    .object({
        name: requiredText("Name", 100),
        wordId: uuidSchema,
        difficulty: difficultySchema,
        hintsEnabled: z.boolean(),
    })
    .strict();

export const updateWordleConfigurationSchema =
    createWordleConfigurationSchema
        .partial()
        .refine(containsAtLeastOneField, {
            message: "Provide at least one field to update.",
        });

export const createWordSearchConfigurationSchema = z
    .object({
        name: requiredText("Name", 100),
        wordListId: uuidSchema,
        difficulty: difficultySchema,
        seed: z
            .number()
            .int("Seed must be an integer.")
            .min(
                POSTGRES_INTEGER_MINIMUM,
                "Seed is below PostgreSQL's integer range.",
            )
            .max(
                POSTGRES_INTEGER_MAXIMUM,
                "Seed exceeds PostgreSQL's integer range.",
            ),
        hintsEnabled: z.boolean(),
    })
    .strict();

export const updateWordSearchConfigurationSchema =
    createWordSearchConfigurationSchema
        .partial()
        .refine(containsAtLeastOneField, {
            message: "Provide at least one field to update.",
        });

export type JsonValidationResult<T> = 
        | {
            readonly success: true;
            readonly data: T;
        }
        | {
            readonly success: false;
            readonly response: Response;
        };

// Converts Zod issues into Orate's public error format.
export function validationErrorResponse(
    error: z.ZodError,
): Response {
    const details: ApiErrorDetail[] = 
        error.issues.map((issue) => ({
            path: 
                issue.path.length > 0 
                    ? issue.path.map(String).join(".")
                    : "$",
                message: issue.message,
        }));

        return errorResponse(
            "VALIDATION_ERROR",
            "Request validation failed.",
            400,
            details,
        ); 
}

// Parses JSON and validates it against the schema required by a route.
export async function parseJsonRequest< 
    TSchema extends z.ZodType,
>(
    request: Request,
    schema: TSchema,
): Promise<JsonValidationResult<z.output<TSchema>>> {
    let requestBody: unknown;

    try {
        requestBody = await request.json();
    } catch {
        return {
            success: false,
            response: errorResponse(
                "INVALID_JSON",
                "Request body must contain valid JSON.",
                400,
            ),
        };
    }

    const result = schema.safeParse(requestBody); 

    if (!result.success) {
        return { 
            success: false,
            response: validationErrorResponse(result.error),
        };
    }

    return {
        success: true,
        data: result.data,
    };
}