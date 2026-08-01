import Link from "next/link";

export function SiteHeader() {
    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="rounded-md text-xl font-bold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                    aria-label="Orate home"
                >
                    Orate
                </Link>

                <nav
                    className="flex items-center gap-6"
                    aria-label="Primary navigation"
                >
                    <Link
                        href="/#activities"
                        className="rounded-md font-medium text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                    >
                        Activities
                    </Link>

                    <Link
                        href="/wordle"
                        className="rounded-md font-medium text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                    >
                        Wordle
                    </Link>

                    <Link
                        href="/word-search"
                        className="rounded-md font-medium text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                    >
                        Word Search
                    </Link>

                </nav>
            </div>
        </header>
    );
}
