import { expect, test } from "@playwright/test";

/* 
    This tests that an the activity loads the content from the DB 
    the activity preview loads and html renders
    board and phoneme keyboard are accessible
    changing difficulty regenerates the activity

    Might try to add the test inputing phonemes to test activity input etc. 
 */

// Verifies the generatied Wordle activity is rendered inside the learner preview. 
test("learner can view a generated Wordle", async ({
    page,
}) => {
    await page.goto("/wordle");

    const wordListSelect = page.getByLabel("Word list");

    await expect(wordListSelect,).toBeEnabled();

    // Selects Orates default seeded word list instead of relying  on the order of options returned by the database.
    const starterListOption = wordListSelect
        .locator("option")
        .filter({
            hasText: "Orate Starter Words",
        });
    
    await expect(starterListOption,).toHaveCount(1);
    
    // Reads the database ID stored in the option's value attribute.
    const starterListId = 
        await starterListOption.getAttribute("value",);
    
    
    if (!starterListId) {
        throw new Error(" The seesed Orate Starter Words list is unavailable.");
    }
    
    // Selects the seeded list and waits until the list's words are available
    await wordListSelect.selectOption(starterListId);
    await expect(
        page.getByLabel("Target phoneme word"),
    ).toBeEnabled();

    // Creates a locator for the standalone activity builder 
    const preview = page.frameLocator(
        'iframe[title^="Playable preview of"][title$="Wordle"]'
    );

    // Confirms the activity preview has loaded 
    await expect(
        preview.getByRole("heading", {
            name: "Build the phoneme word",
        }),
    ).toBeVisible();

    // Checks / expects the default settings are applied. 
    await expect(
        preview.getByRole("grid", {
            name: "Wordle board with 6 attempts",
        }),
    ).toBeVisible();

    await expect(
        preview.getByRole("group", {
            name: "Phoneme keyboard",
        }),
    ).toBeVisible();

    await expect(
        preview.getByText("Attempt 1 of 6", {
            exact: true,
        },),
    ).toBeVisible();

     // Locates the Easy difficulty control 
    const easyDifficulty = page.getByRole("radio", {
        name: /^Easy/i,
    });

    // Selects the easy difficulty
    await easyDifficulty.check();

    await expect(easyDifficulty).toBeChecked();

    // Confirms difficulty setting has been applied. 
    await expect(preview.getByText(
        "Attempt 1 of 8",
        {
            exact: true,
        },
    ),).toBeVisible();

    await expect(preview.getByRole("grid", 
        {
            name: "Wordle board with 8 attempts",
        }),
    ).toBeVisible();


})