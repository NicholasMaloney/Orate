import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
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
            className="flex-1 bg-(--background)] text-[var(--foreground)"
        >
            <section className="mx-auto max-w-4xl px-6 py-(--page-spacing)">
                <PageIntro
                    eyebrow="Saved preferences"
                    title="Make Orate comfortable for you."
                    description="Your colour and spacing choices are stored as browser cookies and restored when you return."
                />

                <SettingsPanel />
            </section>
        </main>
    );
}