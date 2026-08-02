import Link from "next/link";
import { SiteNavigation } from "./site-navigation";

// Shared header displayed above every route
export function SiteHeader() {
    return (
        <header className="border-b border-(--border) bg-(--surface) text-foreground">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-(--control-spacing)">
                <Link
                    href="/"
                    className="shrink-0 rounded-md text-xl font-bold text-foreground hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)"            
                    aria-label="Orate home"
                >
                    Orate
                </Link>
                <SiteNavigation />
            </div>
        </header>
    );
}
