import { defineConfig, devices, } from "@playwright/test";

export default defineConfig({
    // Stores the test files here
    testDir: "./tests/e2e",

    // Keeps Playwright artifacts separate from saved load and accessibility evidence.
    outputDir: "./test-results/playwright",

    // Runs test files sequentially to avoid conflicts with shared database data
    fullyParallel: false,
    workers: 1,

    // Reports failures immediately
    retries: 0,

    // Prints results in the terminal and creates an HTML report.
    reporter: [
        ["list"],
        [
            "html",
            {
                outputFolder:
                    "playwright-report",
                open: "never",
            },
        ],
    ],
    // Applies these settings to every browser test. Targets Docker by default.
    use: {
        baseURL:
            process.env.PLAYWRIGHT_BASE_URL ??
            "http://127.0.0.1:3000",
        trace: "retain-on-failure",
        screenshot:
            "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices[
                "Desktop Chrome"
                ],
            },
        },
    ],
});