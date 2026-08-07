import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { SITE_IDENTITY, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
    title: "About",
    description:
        "Learn about Orate, its phoneme activities, technical scope, and creator.",
};

export default function AboutPage() {
    return (
        <main
            id="main-content"
            className="flex-1 bg-background text-foreground"
        >
            <div className="mx-auto max-w-6xl px-6 py-(--page-spacing)">
                <PageIntro
                    eyebrow="About the project"
                    title={`About ${SITE_NAME}.`}
                    description="A teacher-facing tool for building, previewing, and downloading interactive phoneme activities."
                />

                <div className="mt-12 grid gap-(--panel-spacing) lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="space-y-(--panel-spacing)">
                        <section
                            className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                            aria-labelledby="project-purpose-heading"
                        >
                            <h2
                                id="project-purpose-heading"
                                className="text-2xl font-semibold"
                            >
                                What this project does
                            </h2>

                            <div className="mt-4 space-y-4 text-(--muted-text)">
                                <p>
                                    Orate helps teachers configure phoneme-based
                                    classroom activities without manually building
                                    each activity from scratch.
                                </p>

                                <p>
                                    Teachers choose the activity settings, test the
                                    learner experience in a live preview, and
                                    download a standalone HTML file that can be
                                    opened in a normal web browser.
                                </p>

                                <p>
                                    This version is a frontend-only application.
                                    React manages the interactive interface,
                                    TypeScript describes the project&apos;s data,
                                    and Next.js provides the routes and shared page
                                    structure.
                                </p>

                                <p>
                                    The project does not currently use a database,
                                    user accounts, or a separate backend API.
                                    Preferences are stored in browser cookies, while
                                    generated activities are downloaded directly by
                                    the browser.
                                </p>
                            </div>
                        </section>

                        <section
                            className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                            aria-labelledby="activities-overview-heading"
                        >
                            <h2
                                id="activities-overview-heading"
                                className="text-2xl font-semibold"
                            >
                                Included activities
                            </h2>

                            <div className="mt-6 grid gap-(--control-spacing) md:grid-cols-2">
                                <article className="rounded-xl border border-(--border) bg-(--surface-muted) p-(--panel-spacing)">
                                    <h3 className="text-xl font-semibold">
                                        Phoneme Wordle
                                    </h3>

                                    <p className="mt-3 text-(--muted-text)">
                                        Learners assemble a phoneme sequence and
                                        receive position-based feedback after each
                                        submitted guess.
                                    </p>

                                    <Link
                                        href="/wordle"
                                        className="mt-5 inline-block rounded-md font-semibold text-(--accent) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)"
                                    >
                                        Open Wordle builder
                                    </Link>
                                </article>

                                <article className="rounded-xl border border-(--border) bg-(--surface-muted) p-(--panel-spacing)">
                                    <h3 className="text-xl font-semibold">
                                        Phoneme Word Search
                                    </h3>

                                    <p className="mt-3 text-(--muted-text)">
                                        Learners find phoneme words inside a
                                        deterministic letter grid by selecting each
                                        word&apos;s starting and ending cells.
                                    </p>

                                    <Link
                                        href="/word-search"
                                        className="mt-5 inline-block rounded-md font-semibold text-(--accent) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)"                                    >
                                        Open Word Search builder
                                    </Link>
                                </article>
                            </div>
                        </section>

                        <section
                            className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                            aria-labelledby="instructional-video-heading"
                        >
                            <p className="text-sm font-semibold uppercase tracking-wider text-(--accent)">
                                Project demonstration
                            </p>

                            <h2
                                id="instructional-video-heading"
                                className="mt-2 text-2xl font-semibold"
                            >
                                How to use Orate
                            </h2>

                            <p
                                id="instructional-video-description"
                                className="mt-3 text-(--muted-text)"
                            >
                                This video demonstration provides an overview of Orate, and explains how teachers and speach pathologists can configure,
                                preview, and download the Wordle and Word Search activities.
                            </p>

                            <figure className="mt-6">
                                <video
                                    controls
                                    preload="metadata"
                                    playsInline
                                    aria-describedby="instructional-video-description"
                                    className="aspect-video w-full rounded-xl border border-(--border) bg-black object-contain"
                                >
                                    <source
                                        src="/videos/orate-demonstration.mp4"
                                        type="video/mp4"
                                    />

                                    <track
                                        src="/videos/orate-demonstration-captions.vtt"
                                        kind="captions"
                                        srcLang="en"
                                        label="English"
                                        default
                                    />

                                    <p>
                                        Your browser does not support embedded video. You can{" "}
                                        <a href="/videos/orate-demonstration.mp4">
                                            download the demonstration video
                                        </a>
                                        {" "}instead.
                                    </p>
                                </video>
                            </figure>
                        </section>
                    </div>

                    <aside
                        className="self-start rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                        aria-labelledby="student-details-heading"
                    >
                        <h2
                            id="student-details-heading"
                            className="text-xl font-semibold"
                        >
                            Student details
                        </h2>

                        <dl className="mt-5 space-y-4">
                            <div>
                                <dt className="text-sm font-semibold uppercase tracking-wider text-(--muted-text)">
                                    Name
                                </dt>

                                <dd className="mt-1 font-medium">
                                    {SITE_IDENTITY.name}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-semibold uppercase tracking-wider text-(--muted-text)">
                                    Student number
                                </dt>

                                <dd className="mt-1 font-medium">
                                    {SITE_IDENTITY.studentNumber}
                                </dd>
                            </div>
                        </dl>

                        <div className="my-(--panel-spacing) border-t border-(--border)" />

                        <h2 className="text-xl font-semibold">
                            Technical scope
                        </h2>

                        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-(--muted-text)">
                            <li>Next.js App Router</li>
                            <li>React interactive components</li>
                            <li>TypeScript data models</li>
                            <li>Tailwind CSS styling</li>
                            <li>Cookie-based preferences</li>
                            <li>Standalone HTML generation</li>
                        </ul>
                    </aside>
                </div>
            </div>
        </main>
    );
}