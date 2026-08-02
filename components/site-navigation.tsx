"use client";

import Link from "next/link";
import {
    useRef,
    useState,
    type KeyboardEvent,
} from "react";

// Primary links that appear directly in the desktop header.

const PRIMARY_LINKS = [
    {
        href: "/",
        label: "Home",
    },
    {
        href: "/wordle",
        label: "Wordle",
    },
    {
        href: "/word-search",
        label: "Word Search",
    },
] as const;

// Secondary links remain inside hamburger menu

const COMPACT_LINKS = [
    {
        href: "/about",
        label: "About",
    },
    {
        href: "/settings",
        label: "Settings",
    },
] as const;

const desktopLinkClasses =
    "rounded-md font-medium text-(--muted-text) hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 dark:hover:text-blue-300 dark:focus-visible:outline-blue-300";

const menuLinkClasses =
    "block rounded-lg px-4 py-3 font-medium text-(--muted-text) hover:bg-(--surface-muted) hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:hover:text-blue-300 dark:focus-visible:outline-blue-300";

export function SiteNavigation() {
    const [isMenuOpen, setIsMenuOpen] =
        useState(false);

    const menuButtonRef =
        useRef<HTMLButtonElement>(null);

    function closeMenu() {
        setIsMenuOpen(false);
    }

    function handleMenuKeyDown(
        keyboardEvent: KeyboardEvent<HTMLDivElement>,
    ) {
        if (keyboardEvent.key !== "Escape") {
            return;
        }

        keyboardEvent.preventDefault();
        closeMenu();
        menuButtonRef.current?.focus();
    }

    return (
        <div
            className="relative flex items-center gap-(--control-spacing)"
            onKeyDown={handleMenuKeyDown}
        >
            {/*
             * The main routes are shown directly in the desktop header.
             * They are hidden on smaller screens to prevent wrapping.
             */}
            <nav
                className="hidden items-center gap-x-(--control-spacing) md:flex"
                aria-label="Primary navigation"
            >
                {PRIMARY_LINKS.map((navigationLink) => (
                    <Link
                        key={navigationLink.href}
                        href={navigationLink.href}
                        className={desktopLinkClasses}
                    >
                        {navigationLink.label}
                    </Link>
                ))}
            </nav>

            <button
                ref={menuButtonRef}
                type="button"
                onClick={() =>
                    setIsMenuOpen(
                        (currentState) => !currentState,
                    )
                }
                aria-expanded={isMenuOpen}
                aria-controls="compact-navigation"
                className="inline-flex size-11 items-center justify-center rounded-lg border border-(--border) bg-(--surface-muted) text-foreground hover:border-blue-400 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:hover:text-blue-300 dark:focus-visible:outline-blue-300"
            >
                <span className="sr-only">
                    {isMenuOpen
                        ? "Close compact navigation"
                        : "Open compact navigation"}
                </span>

                {isMenuOpen ? (
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M6 6l12 12" />
                        <path d="M18 6 6 18" />
                    </svg>
                ) : (
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M4 6h16" />
                        <path d="M4 12h16" />
                        <path d="M4 18h16" />
                    </svg>
                )}
            </button>

            <nav
                id="compact-navigation"
                hidden={!isMenuOpen}
                className="absolute right-0 top-full z-20 mt-3 w-64 rounded-xl border border-(--border) bg-(--surface) p-2 shadow-lg"
                aria-label="Compact navigation"
            >
                {/** On mobile, the direct desktop links move into the menu so every route remains available. */}
                <div className="md:hidden">
                    {PRIMARY_LINKS.map((navigationLink) => (
                        <Link
                            key={navigationLink.href}
                            href={navigationLink.href}
                            onClick={closeMenu}
                            className={menuLinkClasses}
                        >
                            {navigationLink.label}
                        </Link>
                    ))}
                </div>

                {/*
                 * About and Settings always appear inside the compact menu.
                 * The divider separates them from the mobile primary links,
                 * but disappears on desktop where those links are absent.
                 */}
                <div className="mt-2 border-t border-(--border) pt-2 md:mt-0 md:border-t-0 md:pt-0">
                    {COMPACT_LINKS.map((navigationLink) => (
                        <Link
                            key={navigationLink.href}
                            href={navigationLink.href}
                            onClick={closeMenu}
                            className={menuLinkClasses}
                        >
                            {navigationLink.label}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}