import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { Dashboard, } from "@/features/dashboard/dashboard";

export const metadata: Metadata = {
    title: "Operational Dashboard",
    description: "Monitor Orate's content, generated activities, usage, and health",
};

export default function DashboardPage() {
    return (
        <main
            id="main-content"
            className="flex-1 bg-background text-foreground"
        >
            <section className="mx-auto max-w-6xl px-6 py-(--page-spacing)">
                <PageIntro
                    eyebrow="Reporting and observability"
                    title="Monitor Orate activity."
                    description="Review stored content, activity creation, generated outputs, builder usage, and operational warnings."
                />

                <Dashboard />
            </section>
        </main>
    );
}