/**
 * Shared introduction displayed at the beginning of internal pages.
 *
 * Keeping this markup in one component ensures every route uses the same
 * heading hierarchy, spacing, theme colours, and description styling.
 */
interface PageIntroProps {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
}

export function PageIntro({
    eyebrow,
    title,
    description,
}: PageIntroProps) {
    return (
        <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                {eyebrow}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                {title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-(--muted-text)">
                {description}
            </p>
        </header>
    );
}