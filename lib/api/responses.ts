// Describes one field-specific validation problem.
export interface ApiErrorDetail {
    readonly path: string;
    readonly message: string;
}

// Successful API responses always place their result inside data.
export interface ApiSuccessBody<T> {
    readonly data: T;
}

// Failed API responses use a stable machine-readable error structure.
export interface ApiErrorBody {
    readonly error: {
        readonly code: string;
        readonly message: string;
        readonly details?: readonly ApiErrorDetail[];
    };
}

// Creates a JSON response for successful API operations
export function successResponse<T>(
    data: T,
    status = 200, 
): Response {
    return Response.json(
        { data } satisfies ApiSuccessBody<T>,
        { status },
    ); 
}

// Creates a consistent JSON response for API failures. 
export function errorResponse(
    code: string,
    message: string,
    status: number,
    details?: readonly ApiErrorDetail[],
): Response {
    const body: ApiErrorBody = {
        error: {
            code, 
            message,
            ...(details ? { details } : {}), 
        },
    };

    return Response.json(body, { status });
}

// A successful deletion returns status 204 without a response body.
export function noContentResponse(): Response {
    return new Response(null, {
        status: 204,
    });
}