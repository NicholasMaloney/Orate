import Link from "next/link";

// Shared header displayed above every route, Theme colours come from CSS variables, while density controls the padding and distance between navigation links.
export function SiteHeader() {
    const navigationLinkClasses =
        "rounded-md font-medium text-[var(--muted-text)] hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 dark:hover:text-blue-300 dark:focus-visible:outline-blue-300";

    return (
        <header className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-[var(--control-spacing)]">
                <Link
                    href="/"
                    className="shrink-0 rounded-md text-xl font-bold text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 dark:focus-visible:outline-blue-300"
                    aria-label="Orate home"
                >
                    Orate
                </Link>

                <nav
                    className="flex flex-wrap items-center justify-end gap-x-[var(--control-spacing)] gap-y-2"
                    aria-label="Primary navigation"
                >
                    <Link
                        href="/#activities"
                        className={navigationLinkClasses}
                    >
                        Activities
                    </Link>

                    <Link
                        href="/wordle"
                        className={navigationLinkClasses}
                    >
                        Wordle
                    </Link>

                    <Link
                        href="/word-search"
                        className={navigationLinkClasses}
                    >
                        Word Search
                    </Link>

                    <Link
                        href="/settings"
                        className={navigationLinkClasses}
                    >
                        Settings
                    </Link>
                </nav>
            </div>
        </header>
    );
}
