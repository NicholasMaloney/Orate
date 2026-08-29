"use client";

/**
 * Client-side owner of preferences shared across the application.
 * React Context allows deeply nested components to access preferences without
 * passing them manually through every intermediate component.
 */
import {
    createContext,
    useContext,
    useState,
} from "react";
import { savePreferences } from "@/app/actions/preferences";
import { colorSchemeForTheme, DEFAULT_PREFERENCES } from "@/lib/preferences";
import type {
    LayoutDensity,
    PreferenceState,
    Theme,
} from "@/lib/types";

// Describes everything available to components that consume the Context.
interface PreferenceContextValue {
    readonly preferences: PreferenceState;
    readonly status: string;

    setTheme: (theme: Theme) => void;

    setDensity: (
        density: LayoutDensity,
    ) => void;

    resetPreferences: () => void;
}

// null allows usePreferences() to detect when a component is accidentally rendered outside the required provider.
const PreferenceContext =
    createContext<PreferenceContextValue | null>(
        null,
    );

// Applies the current values to the root HTML element.  
// CSS will later use these data attributes to select the correct colour and spacing rules.

function applyPreferencesToDocument(
    preferences: PreferenceState,
): void {
    const rootElement =
        document.documentElement;

    rootElement.dataset.theme =
        preferences.theme;

    rootElement.dataset.density =
        preferences.density;

    rootElement.style.colorScheme =
        colorSchemeForTheme(
            preferences.theme,
        );
}

interface PreferenceProviderProps {
    readonly initialPreferences: PreferenceState;
    readonly children: React.ReactNode;
}

export function PreferenceProvider({
    initialPreferences,
    children,
}: PreferenceProviderProps) {
    // The initial state will come from validated cookies read by the root Server Component.
    
    const [preferences, setPreferences] =
        useState<PreferenceState>(
            initialPreferences,
        );

    const [status, setStatus] = useState("");

    
    // Apply a preference change immediately, then persist it on the server.
    // This is an optimistic update: the user sees the result without waiting for the cookie request to finish.
    async function updatePreferences(
        nextPreferences: PreferenceState,
    ): Promise<void> {
        setPreferences(nextPreferences);

        applyPreferencesToDocument(
            nextPreferences,
        );

        setStatus("Saving preferences...");

        try {
            await savePreferences(
                nextPreferences,
            );

            setStatus("Preferences saved.");
        } catch {
            setStatus(
                "Preferences could not be saved. Please try again.",
            );
        }
    }

    
    // Context consumers receive intention-revealing functions instead of the raw React state setter.
    const contextValue: PreferenceContextValue = {
        preferences,
        status,

        setTheme: (theme) => {
            void updatePreferences({
                ...preferences,
                theme,
            });
        },

        setDensity: (density) => {
            void updatePreferences({
                ...preferences,
                density,
            });
        },

        resetPreferences: () => {
            void updatePreferences(
                DEFAULT_PREFERENCES,
            );
        },
    };

    return (
        <PreferenceContext.Provider
            value={contextValue}
        >
            {children}
        </PreferenceContext.Provider>
    );
}

/// Read the nearest PreferenceProvider. The custom hook keeps components from importing and checking the Context manually every time.

export function usePreferences(): PreferenceContextValue {
    const context =
        useContext(PreferenceContext);

    if (context === null) {
        throw new Error(
            "usePreferences must be used inside PreferenceProvider.",
        );
    }

    return context;
}