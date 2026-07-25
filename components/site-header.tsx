import Link from "next/link";

export function SiteHeader() {
    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6x1 items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="rounded-md text-x1 font-bold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                    aria-label="Orate home"
                >
                    Orate
                </Link>

                <nav aria-label="Primary navigation">
                    <Link
                        href="/#activities"
                        className="rounded-md font-medium text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                    >
                        Activities
                    </Link>
                </nav>
            </div>
        </header>
    );
}
