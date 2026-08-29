import {
    describe,
    expect,
    it,
} from "vitest";

import {
    colorSchemeForTheme,
    isTheme,
    preferencesFromCookies,
    resolveTheme,
} from "@/lib/preferences";

describe("theme preferences", () => {
    it.each([
        "light",
        "dark",
        "system",
    ] as const)(
        "accepts the %s theme",
        (theme) => {
            expect(isTheme(theme)).toBe(true);
        },
    );

    it.each([
        "automatic",
        "blue",
        "",
        null,
        undefined,
    ])(
        "rejects unsupported theme value %s",
        (theme) => {
            expect(isTheme(theme)).toBe(false);
        },
    );

    it("restores the System theme from cookies", () => {
        expect(
            preferencesFromCookies(
                "system",
                "compact",
            ),
        ).toEqual({
            theme: "system",
            density: "compact",
        });
    });

    it("falls back from an invalid theme independently", () => {
        expect(
            preferencesFromCookies(
                "automatic",
                "compact",
            ),
        ).toEqual({
            theme: "light",
            density: "compact",
        });
    });

    it("lets the browser select the CSS colour scheme for System", () => {
        expect(
            colorSchemeForTheme("system"),
        ).toBe("light dark");

        expect(
            colorSchemeForTheme("dark"),
        ).toBe("dark");
    });
});

describe("resolved themes", () => {
    it.each([
        ["light", true, "light"],
        ["dark", false, "dark"],
        ["system", false, "light"],
        ["system", true, "dark"],
    ] as const)(
        "resolves %s with system dark=%s to %s",
        (
            preference,
            systemPrefersDark,
            expectedTheme,
        ) => {
            expect(
                resolveTheme(
                    preference,
                    systemPrefersDark,
                ),
            ).toBe(expectedTheme);
        },
    );
});