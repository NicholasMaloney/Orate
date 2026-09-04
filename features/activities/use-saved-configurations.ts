"use client";
import {useEffect, useState} from "react";
import {readApiData, requireNoContent} from "@/lib/api/client";
/** Reusable client hook for Wordle and Word Search configurations.
 * TRecord allows the hook to manage both WordleConfigurationRecord and WordSearchConfigurationRecord
 * It loads the saved collection, delegates atomic loading to the builder,
 * creates records with POST, updates them with PATCH, and deletes them
 * through the bodyless 204 response contract. Records remain sorted after
 * changes, while API errors such as duplicate names stay visible to users.
 */


// Defines the minimum fields required for a saved config.
interface NamedConfiguration {
    readonly id: string;
    readonly name: string;
}

// Defines the options required by the saved config 
interface SavedConfigurationOptions<
    TRecord extends NamedConfiguration,
> {
    readonly endpoint: string;
    readonly label: string;
    readonly onLoad: (
        record: TRecord,
    ) => Promise<void> | void;
}

// Sorts configs alphabetically by name
function sortRecords<
    TRecord extends NamedConfiguration,
>(
    records: readonly TRecord[],
): readonly TRecord[] {
    return [...records].sort((left, right) =>
        left.name.localeCompare(right.name),
    );
}

// Manages loading, creating, updating, and deleting saved config.
export function useSavedConfigurations<
    TRecord extends NamedConfiguration,
>({
    endpoint,
    label,
    onLoad,
}: SavedConfigurationOptions<TRecord>) {
// Stores all saved configurations returned by the API.
    const [records, setRecords] = useState<
        readonly TRecord[]
    >([]);

    // Tracks the currently selected configuration.
    const [selectedId, setSelectedId] =
        useState("");

    // Stores the config name.
    const [name, setName] = useState("");

    // Tracks whether an API operation is in progress.
    const [busy, setBusy] = useState(true);

    const [statusMessage, setStatusMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    // Load existing configurations when the hook mounts.
    useEffect(() => {
        const controller =
            new AbortController();

        async function loadRecords() {
            try {
                const response = await fetch(
                    endpoint,
                    {
                        cache: "no-store",
                        signal: controller.signal,
                    },
                );

                const loaded =
                    await readApiData<
                        readonly TRecord[]
                    >(
                        response,
                        `${label} configurations could not be loaded.`,
                    );

                if (!controller.signal.aborted) {
                    setRecords(
                        sortRecords(loaded),
                    );
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : `${label} configurations could not be loaded.`,
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setBusy(false);
                }
            }
        }

        void loadRecords();

        return () => controller.abort();
    }, [endpoint, label]);

    function clearMessages() {
        setStatusMessage("");
        setErrorMessage("");
    }

    // Load builder settings before committing the selection.
    async function selectRecord(
        id: string,
    ): Promise<void> {
        clearMessages();

        if (!id) {
            setSelectedId("");
            setName("");
            return;
        }

        const record = records.find(
            (candidate) =>
                candidate.id === id,
        );

        if (!record) {
            setErrorMessage(
                "The selected configuration is unavailable.",
            );
            return;
        }

        setBusy(true);

        try {
            await onLoad(record);
            setSelectedId(record.id);
            setName(record.name);
            setStatusMessage(
                `${record.name} was loaded.`,
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "The configuration could not be loaded.",
            );
        } finally {
            setBusy(false);
        }
    }

    async function save(
        method: "POST" | "PATCH",
        payload: object,
    ): Promise<void> {
        clearMessages();

        if (
            method === "PATCH" &&
            !selectedId
        ) {
            setErrorMessage(
                "Select a configuration before updating it.",
            );
            return;
        }

        setBusy(true);

        try {
            const response = await fetch(
                method === "POST"
                    ? endpoint
                    : `${endpoint}/${selectedId}`,
                {
                    method,
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        ...payload,
                    }),
                },
            );

            const saved =
                await readApiData<TRecord>(
                    response,
                    "The configuration could not be saved.",
                );

            setRecords((current) =>
                sortRecords([
                    ...current.filter(
                        (record) =>
                            record.id !==
                            saved.id,
                    ),
                    saved,
                ]),
            );
            setSelectedId(saved.id);
            setName(saved.name);
            setStatusMessage(
                `${saved.name} was ${
                    method === "POST"
                        ? "created"
                        : "updated"
                }.`,
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "The configuration could not be saved.",
            );
        } finally {
            setBusy(false);
        }
    }

    async function remove(): Promise<void> {
        const record = records.find(
            (candidate) =>
                candidate.id === selectedId,
        );

        if (
            !record ||
            !window.confirm(
                `Delete configuration "${record.name}"?`,
            )
        ) {
            return;
        }

        clearMessages();
        setBusy(true);

        try {
            const response = await fetch(
                `${endpoint}/${record.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                },
            );

            await requireNoContent(
                response,
                "The configuration could not be deleted.",
            );

            setRecords((current) =>
                current.filter(
                    (candidate) =>
                        candidate.id !==
                        record.id,
                ),
            );
            setSelectedId("");
            setName("");
            setStatusMessage(
                `${record.name} was deleted.`,
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "The configuration could not be deleted.",
            );
        } finally {
            setBusy(false);
        }
    }

    return {
        records,
        selectedId,
        name,
        busy,
        statusMessage,
        errorMessage,
        setName,
        selectRecord,
        create: (payload: object) =>
            save("POST", payload),
        update: (payload: object) =>
            save("PATCH", payload),
        remove,
    } as const;
}