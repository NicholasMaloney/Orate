"use client";

interface ConfigurationOption {
    readonly id: string;
    readonly name: string;
}

interface SavedConfigurationPanelProps {
    readonly idPrefix: string;
    readonly activityLabel: string;
    readonly records:
        readonly ConfigurationOption[];
    readonly selectedId: string;
    readonly name: string;
    readonly busy: boolean;
    readonly canSave: boolean;
    readonly statusMessage: string;
    readonly errorMessage: string;
    readonly onSelect: (
        id: string,
    ) => Promise<void>;
    readonly onNameChange: (
        name: string,
    ) => void;
    readonly onCreate: () => Promise<void>;
    readonly onUpdate: () => Promise<void>;
    readonly onDelete: () => Promise<void>;
}

export function SavedConfigurationPanel({
    idPrefix,
    activityLabel,
    records,
    selectedId,
    name,
    busy,
    canSave,
    statusMessage,
    errorMessage,
    onSelect,
    onNameChange,
    onCreate,
    onUpdate,
    onDelete,
}: SavedConfigurationPanelProps) {
    const headingId =
        `${idPrefix}-configuration-heading`;
    const selectorId =
        `${idPrefix}-configuration`;
    const nameId =
        `${idPrefix}-configuration-name`;
    const hasName =
        name.trim().length > 0;

    return (
        <section
            aria-labelledby={headingId}
            aria-busy={busy}
            className="mt-8 border-t border-(--border) pt-6"
        >
            <h3
                id={headingId}
                className="font-semibold text-foreground"
            >
                Saved configurations
            </h3>

            <p className="mt-1 text-sm text-(--muted-text)">
                Reuse a saved {activityLabel} setup or
                store the current settings under a clear
                name.
            </p>

            <div className="mt-4">
                <label
                    htmlFor={selectorId}
                    className="block font-semibold text-foreground"
                >
                    Saved setup
                </label>

                <select
                    id={selectorId}
                    value={selectedId}
                    disabled={busy}
                    onChange={(event) =>
                        void onSelect(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-lg border border-(--control-border) bg-(--surface) px-3 py-2 text-foreground focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <option value="">
                        Create a new configuration
                    </option>

                    {records.map((record) => (
                        <option
                            key={record.id}
                            value={record.id}
                        >
                            {record.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-4">
                <label
                    htmlFor={nameId}
                    className="block font-semibold text-foreground"
                >
                    Configuration name
                </label>

                <p
                    id={`${nameId}-help`}
                    className="mt-1 text-sm text-(--muted-text)"
                >
                    Names must be unique for this activity
                    type.
                </p>

                <input
                    id={nameId}
                    type="text"
                    value={name}
                    maxLength={100}
                    disabled={busy}
                    required
                    aria-describedby={`${nameId}-help`}
                    onChange={(event) =>
                        onNameChange(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-lg border border-(--control-border) bg-(--surface) px-3 py-2 text-foreground focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={
                        busy ||
                        !canSave ||
                        !hasName
                    }
                    onClick={() =>
                        void onCreate()
                    }
                    className="rounded-lg bg-(--action) px-4 py-2 font-semibold text-(--action-text) hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Save new
                </button>

                <button
                    type="button"
                    disabled={
                        busy ||
                        !selectedId ||
                        !canSave ||
                        !hasName
                    }
                    onClick={() =>
                        void onUpdate()
                    }
                    className="rounded-lg border border-(--control-border) bg-(--surface-muted) px-4 py-2 font-semibold text-foreground hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Update
                </button>

                <button
                    type="button"
                    disabled={
                        busy || !selectedId
                    }
                    onClick={() =>
                        void onDelete()
                    }
                    className="rounded-lg border border-(--danger) bg-(--surface) px-4 py-2 font-semibold text-(--danger) hover:bg-(--surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Delete
                </button>
            </div>

            <p
                aria-live="polite"
                className="mt-3 min-h-6 text-sm text-(--success)"
            >
                {statusMessage}
            </p>

            <p
                role={
                    errorMessage
                        ? "alert"
                        : undefined
                }
                className="min-h-6 text-sm text-(--danger)"
            >
                {errorMessage}
            </p>
        </section>
    );
}