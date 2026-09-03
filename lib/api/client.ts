/** This helper gives later Library and builder code one consistent client-side boundary.
 * Existing components assume every response contains JSON.
 * Successful DELETE responses use 204 with no body.
 * API errors such as WORD_CONFLICT contain useful messages that should reach the teacher.
  */

function isObject(
    value: unknown,
): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

async function readBody(
    response: Response,
): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

function getErrorMessage(
    body: unknown,
    fallback: string,
): string {
    if (
        isObject(body) &&
        isObject(body.error) &&
        typeof body.error.message === "string"
    ) {
        return body.error.message;
    }

    return fallback;
}

export async function readApiData<T>(
    response: Response,
    fallback: string,
): Promise<T> {
    const body = await readBody(response);

    if (
        !response.ok ||
        !isObject(body) ||
        !("data" in body)
    ) {
        throw new Error(
            getErrorMessage(body, fallback),
        );
    }

    return body.data as T;
}

// Successful DELETE responses have no JSON body.
export async function requireNoContent(
    response: Response,
    fallback: string,
): Promise<void> {
    if (response.ok) {
        return;
    }

    const body = await readBody(response);

    throw new Error(
        getErrorMessage(body, fallback),
    );
}