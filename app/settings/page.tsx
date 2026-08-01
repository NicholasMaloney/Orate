import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings-panel";

export const metadata: Metadata = {
    title: "Settings",
    description:
        "Choose persistent theme and layout preferences for Orate.",
};

export default function SettingsPage() {
    return (
        <main
            id="main-content"
            className="flex-1 bg-[var(--background)] text-[var(--foreground)]"
        >
            <section className="mx-auto max-w-4xl px-6 py-[var(--page-spacing)]">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Saved preferences
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                    Make Orate comfortable for you.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-text)]">
                    Your colour and spacing choices are stored as browser
                    cookies and restored when you return.
                </p>

                <SettingsPanel />
            </section>
        </main>
    );
}