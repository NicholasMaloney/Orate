// Shared page footer.
import {
    SITE_DESCRIPTION,
    SITE_IDENTITY,
    SITE_NAME,
} from "@/lib/site";

export function SiteFooter() {
    return (
        <footer className="border-t border-(--border) bg-(--surface) text-foreground">
            <div className="mx-auto flex max-w-6xl flex-col gap-(--control-spacing) px-6 py-(--panel-spacing) sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <strong className="text-lg">
                        {SITE_NAME}
                    </strong>

                    <p className="mt-2 max-w-xl text-sm text-(--muted-text)">
                        {SITE_DESCRIPTION}
                    </p>
                </div>

                <div
                    className="flex flex-col text-sm text-(--muted-text) sm:text-right"
                    aria-label="Student details"
                >
                    <span>
                        {SITE_IDENTITY.name}
                    </span>

                    <span>
                        Student number:{" "}
                        {
                            SITE_IDENTITY.studentNumber
                        }
                    </span>
                </div>
            </div>
        </footer>
    );
}