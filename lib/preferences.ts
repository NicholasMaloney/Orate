/**
 * Preference defaults and runtime validation.
 *
 * TypeScript checks values while developing the application, but cookie values
 * arrive at runtime as ordinary strings. These functions validate those values
 * before the application uses them.
 */
import type {
    LayoutDensity,
    PreferenceState,
    Theme,
} from "@/lib/types";

//Used whenever no valid saved preference exists.
export const DEFAULT_PREFERENCES: PreferenceState = {
    theme: "light",
    density: "comfortable",
};

//Centralising cookie names prevents the Server Action and root layout from accidentally using different names.
export const PREFERENCE_COOKIE_NAMES = {
    theme: "orate_theme",
    density: "orate_density",
} as const;

// A type guard checks runtime data and informs TypeScript about the result.
// If this function returns true, TypeScript knows that `value` is a Theme.
export function isTheme(
    value: unknown,
): value is Theme {
    return value === "light" || value === "dark";
}

// Validate the supported layout-density strings.
export function isLayoutDensity(
    value: unknown,
): value is LayoutDensity {
    return (
        value === "comfortable" ||
        value === "compact"
    );
}

// Validate a complete preference object.
// This will be used by the Server Action before accepting and saving values received from the browser.

export function isPreferenceState(
    value: unknown,
): value is PreferenceState {
    // JavaScript considers null to be an object, so the truthiness check must happen before inspecting its properties.
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate =
        value as Partial<PreferenceState>;

    return (
        isTheme(candidate.theme) &&
        isLayoutDensity(candidate.density)
    );
}

// Convert optional cookie strings into a valid preference object. 
// Each value falls back independently. For example, a valid dark theme remains
// selected even if the density cookie is missing or invalid.

export function preferencesFromCookies(
    themeCookie: string | undefined,
    densityCookie: string | undefined,
): PreferenceState {
    return {
        theme: isTheme(themeCookie)
            ? themeCookie
            : DEFAULT_PREFERENCES.theme,

        density: isLayoutDensity(densityCookie)
            ? densityCookie
            : DEFAULT_PREFERENCES.density,
    };
}