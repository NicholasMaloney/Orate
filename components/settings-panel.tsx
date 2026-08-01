"use client";

/**
 * Interactive controls for the global teacher-interface preferences.
 *
 * The root layout and PreferenceProvider already own the preference data.
 * This component displays that data and provides controls for changing it.
 */
import { usePreferences } from "@/components/preference-provider";
import type {
    LayoutDensity,
    Theme,
} from "@/lib/types";

interface ThemeOption {
    readonly value: Theme;
    readonly label: string;
    readonly description: string;
}

interface DensityOption {
    readonly value: LayoutDensity;
    readonly label: string;
    readonly description: string;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
    {
        value: "light",
        label: "Light",
        description:
            "Use a bright background with dark text.",
    },
    {
        value: "dark",
        label: "Dark",
        description:
            "Use a dark background with light text.",
    },
];

const DENSITY_OPTIONS: readonly DensityOption[] = [
    {
        value: "comfortable",
        label: "Comfortable",
        description:
            "Use more spacing between page elements and controls.",
    },
    {
        value: "compact",
        label: "Compact",
        description:
            "Use less spacing so more content fits on screen.",
    },
];

//  Keeps the repeated button styling in one function.
function preferenceButtonClasses(
    isSelected: boolean,
): string {
    const sharedClasses =
        "w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

    const selectedClasses =
        "border-blue-700 bg-blue-700 text-white";

    const unselectedClasses =
        "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)] hover:border-blue-500";

    return `${sharedClasses} ${
        isSelected
            ? selectedClasses
            : unselectedClasses
    }`;
}

export function SettingsPanel() {
    const {
        preferences,
        status,
        setTheme,
        setDensity,
        resetPreferences,
    } = usePreferences();

    return (
        <div className="mt-10 space-y-[var(--control-spacing)]">
            <div className="grid gap-6 md:grid-cols-2">
                <section
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-[var(--panel-spacing)] shadow-sm"
                    aria-labelledby="theme-heading"
                >
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                        Appearance
                    </p>

                    <h2
                        id="theme-heading"
                        className="mt-1 text-2xl font-semibold"
                    >
                        Colour theme
                    </h2>

                    <p className="mt-2 text-sm text-[var(--muted-text)]">
                        Choose the colour palette that is easiest to read.
                    </p>

                    <div
                        role="group"
                        aria-labelledby="theme-heading"
                        className="mt-5 space-y-3"
                    >
                        {THEME_OPTIONS.map((option) => {
                            const isSelected =
                                preferences.theme ===
                                option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        setTheme(
                                            option.value,
                                        )
                                    }
                                    aria-pressed={
                                        isSelected
                                    }
                                    className={preferenceButtonClasses(
                                        isSelected,
                                    )}
                                >
                                    <strong className="block">
                                        {option.label}
                                    </strong>

                                    <span
                                        className={`mt-1 block text-sm ${
                                            isSelected
                                                ? "text-blue-100"
                                                : "text-[var(--muted-text)]"
                                        }`}
                                    >
                                        {
                                            option.description
                                        }
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-[var(--panel-spacing)] shadow-sm"
                    aria-labelledby="density-heading"
                >
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                        Layout
                    </p>

                    <h2
                        id="density-heading"
                        className="mt-1 text-2xl font-semibold"
                    >
                        Interface spacing
                    </h2>

                    <p className="mt-2 text-sm text-[var(--muted-text)]">
                        Choose how much space appears between controls.
                    </p>

                    <div
                        role="group"
                        aria-labelledby="density-heading"
                        className="mt-5 space-y-3"
                    >
                        {DENSITY_OPTIONS.map(
                            (option) => {
                                const isSelected =
                                    preferences.density ===
                                    option.value;

                                return (
                                    <button
                                        key={
                                            option.value
                                        }
                                        type="button"
                                        onClick={() =>
                                            setDensity(
                                                option.value,
                                            )
                                        }
                                        aria-pressed={
                                            isSelected
                                        }
                                        className={preferenceButtonClasses(
                                            isSelected,
                                        )}
                                    >
                                        <strong className="block">
                                            {
                                                option.label
                                            }
                                        </strong>

                                        <span
                                            className={`mt-1 block text-sm ${
                                                isSelected
                                                    ? "text-blue-100"
                                                    : "text-[var(--muted-text)]"
                                            }`}
                                        >
                                            {
                                                option.description
                                            }
                                        </span>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </section>
            </div>

            <section
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-[var(--panel-spacing)] shadow-sm"
                aria-labelledby="current-preferences-heading"
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                            Saved preferences
                        </p>

                        <h2
                            id="current-preferences-heading"
                            className="mt-1 text-xl font-semibold"
                        >
                            Current interface
                        </h2>

                        <p className="mt-2 text-[var(--muted-text)]">
                            <span className="capitalize">
                                {preferences.theme}
                            </span>{" "}
                            theme with{" "}
                            <span className="capitalize">
                                {
                                    preferences.density
                                }
                            </span>{" "}
                            spacing.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={resetPreferences}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 font-semibold text-[var(--foreground)] hover:border-blue-500 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:text-blue-300"
                    >
                        Reset defaults
                    </button>
                </div>

                <p
                    className="mt-4 min-h-6 text-sm text-[var(--muted-text)]"
                    aria-live="polite"
                >
                    {status}
                </p>
            </section>
        </div>
    );
}