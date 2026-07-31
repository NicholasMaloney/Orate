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
            className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="activity-preview-heading"
        >
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                    Learner view
                </p>

                <h2
                    id="activity-preview-heading"
                    className="mt-1 text-2xl font-semibold text-slate-950"
                >
                    Live activity preview
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                    This is the exact activity included in the downloaded file.
                </p>
            </div>

            <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
                <iframe
                    srcDoc={html}
                    title={title}
                    sandbox="allow-scripts"
                    className="block min-h-0 w-full flex-1 bg-white"
                    style={{ minHeight: `${height}px` }}
                />
            </div>
        </section>
    );
}