"use server";

/**
 * Server Action for persisting teacher-interface preferences.
 *
 * This code runs on the server because Next.js only allows cookies to be
 * modified from server-controlled request handlers or Server Actions.
 */
import { cookies } from "next/headers";
import {
    isPreferenceState,
    PREFERENCE_COOKIE_NAMES,
} from "@/lib/preferences";
import type { PreferenceState } from "@/lib/types";

// Next.js cookie maxAge values are measured in seconds.
const ONE_YEAR_IN_SECONDS =
    60 * 60 * 24 * 365;

// Validates and saves the complete preference object.
// The Promise return type reflects that Server Actions are asynchronous.
export async function savePreferences(
    preferences: PreferenceState,
): Promise<{ ok: true }> {
    if (!isPreferenceState(preferences)) {
        throw new Error(
            "Invalid display preferences.",
        );
    }

    const cookieStore = await cookies();

    // Both preference cookies use the same security and persistence settings.
    // The cookie applies to every route since the path = '/'
    const cookieOptions = {
        httpOnly: true,
        maxAge: ONE_YEAR_IN_SECONDS,
        path: "/",
        sameSite: "lax" as const,
        secure:
            process.env.NODE_ENV === "production",
    };

    cookieStore.set(
        PREFERENCE_COOKIE_NAMES.theme,
        preferences.theme,
        cookieOptions,
    );

    cookieStore.set(
        PREFERENCE_COOKIE_NAMES.density,
        preferences.density,
        cookieOptions,
    );

    return { ok: true };
}