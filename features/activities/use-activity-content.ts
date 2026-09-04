"use client";

import type { WordListSummary } from "@/features/library/types";
import { readApiData} from "@/lib/api/client";
import type { ActivityWordListData } from "@/lib/types";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

type LoadState =
    | "loading"
    | "ready"
    | "error";

export function useActivityContent() {
    const [wordLists, setWordLists] =
        useState<readonly WordListSummary[]>([]);

    const [
        selectedListId,
        setSelectedListId,
    ] = useState("");

    const [content, setContent] =
        useState<ActivityWordListData | null>(
            null,
        );

    const [listsState, setListsState] =
        useState<LoadState>("loading");

    const [contentState, setContentState] =
        useState<LoadState>("ready");

    const [errorMessage, setErrorMessage] =
        useState("");

    const [reloadNumber, setReloadNumber] =
        useState(0);

    // Refs identify and cancel the latest content request.
    const selectedIdRef = useRef("");
    const contentController =
        useRef<AbortController | null>(null);

    // Loads one list's activity-ready words and canonical phonemes.
    const fetchContent = useCallback(
        async (
            listId: string,
            signal?: AbortSignal,
        ): Promise<ActivityWordListData> => {
            const response = await fetch(
                `/api/activity-content/word-lists/${listId}`,
                {
                    cache: "no-store",
                    headers: {
                        Accept: "application/json",
                    },
                    signal,
                },
            );

            return readApiData<ActivityWordListData>(
                response,
                "Activity content could not be loaded.",
            );
        },
        [],
    );

    // Changes lists and prevents earlier requests winning a race.
    const selectList = useCallback(
        (listId: string) => {
            contentController.current?.abort();

            selectedIdRef.current = listId;
            setSelectedListId(listId);
            setContent(null);
            setErrorMessage("");

            if (!listId) {
                setContentState("ready");
                return;
            }

            const controller =
                new AbortController();

            contentController.current =
                controller;

            setContentState("loading");

            void fetchContent(
                listId,
                controller.signal,
            )
                .then((loadedContent) => {
                    if (
                        controller.signal.aborted ||
                        selectedIdRef.current !==
                            listId
                    ) {
                        return;
                    }

                    setContent(loadedContent);
                    setContentState("ready");
                })
                .catch((error: unknown) => {
                    if (
                        controller.signal.aborted
                    ) {
                        return;
                    }

                    setContent(null);
                    setContentState("error");
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Activity content could not be loaded.",
                    );
                });
        },
        [fetchContent],
    );

    /**
     * Fetches saved-configuration content without changing the
     * currently usable builder. The builder validates the result
     * before committing it.
     */
    const prepareContent = useCallback(
        (listId: string) =>
            fetchContent(listId),
        [fetchContent],
    );

    // Applies content only after the builder accepts it.
    const commitPreparedContent = useCallback(
        (
            prepared:
                ActivityWordListData,
        ) => {
            contentController.current?.abort();

            selectedIdRef.current =
                prepared.id;

            setSelectedListId(prepared.id);
            setContent(prepared);
            setContentState("ready");
            setErrorMessage("");
        },
        [],
    );

    // Loads summaries and selects the first usable list.
    useEffect(() => {
        const controller =
            new AbortController();

        async function loadLists() {
            setListsState("loading");
            setErrorMessage("");

            try {
                const response = await fetch(
                    "/api/word-lists",
                    {
                        cache: "no-store",
                        headers: {
                            Accept:
                                "application/json",
                        },
                        signal:
                            controller.signal,
                    },
                );

                const loadedLists =
                    await readApiData<
                        readonly WordListSummary[]
                    >(
                        response,
                        "Word lists could not be loaded.",
                    );

                setWordLists(loadedLists);
                setListsState("ready");

                const selectedStillExists =
                    loadedLists.some(
                        ({ id }) =>
                            id ===
                            selectedIdRef.current,
                    );

                const nextListId =
                    selectedStillExists
                        ? selectedIdRef.current
                        : loadedLists.find(
                            ({ wordCount }) =>
                                wordCount > 0,
                        )?.id ??
                          loadedLists[0]?.id ??
                          "";

                selectList(nextListId);
            } catch (error) {
                if (
                    controller.signal.aborted
                ) {
                    return;
                }

                setListsState("error");
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Word lists could not be loaded.",
                );
            }
        }

        void loadLists();

        return () => controller.abort();
    }, [
        reloadNumber,
        selectList,
    ]);

    // Cancels an outstanding content request on unmount.
    useEffect(
        () => () =>
            contentController.current?.abort(),
        [],
    );

    return {
        wordLists,
        selectedListId,
        content,
        listsState,
        contentState,
        errorMessage,
        selectList,
        prepareContent,
        commitPreparedContent,

        reloadLists: () =>
            setReloadNumber(
                (current) => current + 1,
            ),

        reloadContent: () =>
            selectList(
                selectedIdRef.current,
            ),
    } as const;
}