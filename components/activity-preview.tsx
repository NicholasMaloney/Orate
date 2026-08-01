interface ActivityPreviewProps {
    readonly html: string;
    readonly title: string;
    readonly height?: number;
}

// Displays the exact standalone HTML that will be downloaded.
//The component is activity-independent, so both Wordle and Word Search can use it.
export function ActivityPreview({
    html,
    title,
    height = 1000,
}: ActivityPreviewProps) {
    return (
        <section
            className="flex min-h-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-[var(--panel-spacing)] shadow-sm"
            aria-labelledby="activity-preview-heading"
        >
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Learner view
                </p>

                <h2
                    id="activity-preview-heading"
                    className="mt-1 text-2xl font-semibold text-[var(--foreground)]"
                >
                    Live activity preview
                </h2>

                <p className="mt-2 text-sm text-[var(--muted-text)]">
                    This is the exact activity included in the downloaded file.
                </p>
            </div>

            <div className="mt-[var(--control-spacing)] flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
                <iframe
                    srcDoc={html}
                    title={title}
                    sandbox="allow-scripts"
                    className="block min-h-0 w-full flex-1 bg-white"
                    style={{
                        minHeight: `${height}px`,
                    }}
                />
            </div>
        </section>
    );
}