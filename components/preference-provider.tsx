"use client";

/**
 * Client-side owner of preferences shared across the application.
 * React Context allows deeply nested components to access preferences without
 * passing them manually through every intermediate component.
 */
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useSyncExternalStore,
} from "react";
import { savePreferences } from "@/app/actions/preferences";
import { DEFAULT_PREFERENCES, resolveTheme, } from "@/lib/preferences";
import type {
    LayoutDensity,
    PreferenceState,
    ResolvedTheme,
    Theme,
} from "@/lib/types";

// Describes everything available to components that consume the Context.
interface PreferenceContextValue {
    readonly preferences: PreferenceState;
    readonly status: string;
    readonly resolvedTheme: ResolvedTheme;

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

const SYSTEM_DARK_THEME_QUERY =
    "(prefers-color-scheme: dark)";

function subscribeToSystemTheme(
    onStoreChange: () => void,
): () => void {
    const mediaQuery = window.matchMedia(
        SYSTEM_DARK_THEME_QUERY,
    );

    mediaQuery.addEventListener(
        "change",
        onStoreChange,
    );

    return () => {
        mediaQuery.removeEventListener(
            "change",
            onStoreChange,
        );
    };
}

function getSystemPrefersDark(): boolean {
    return window.matchMedia(
        SYSTEM_DARK_THEME_QUERY,
    ).matches;
}

function getServerSystemPrefersDark(): boolean {
    return false;
}

// Applies the current values to the root HTML element.  
// CSS will later use these data attributes to select the correct colour and spacing rules.
function applyPreferencesToDocument(
    preferences: PreferenceState,
    resolvedTheme: ResolvedTheme,
): void {
    const rootElement =
        document.documentElement;

    rootElement.dataset.theme =
        resolvedTheme;

    rootElement.dataset.themePreference =
        preferences.theme;

    rootElement.dataset.density =
        preferences.density;

    rootElement.style.colorScheme =
        resolvedTheme;
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
        useState<PreferenceState>(initialPreferences);
    
    const [status, setStatus] = useState("");
    
    const systemPrefersDark = useSyncExternalStore(
            subscribeToSystemTheme,
            getSystemPrefersDark,
            getServerSystemPrefersDark,
        );

    const resolvedTheme = resolveTheme(
        preferences.theme,
        systemPrefersDark,
    );

    useEffect(() => {
        applyPreferencesToDocument(
            preferences,
            resolvedTheme,
        );
    }, [preferences,resolvedTheme,]);
    
    // Apply a preference change immediately, then persist it on the server.
    // This is an optimistic update: the user sees the result without waiting for the cookie request to finish.
    async function updatePreferences(
        nextPreferences: PreferenceState,
    ): Promise<void> {
        setPreferences(nextPreferences);
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
        resolvedTheme,
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