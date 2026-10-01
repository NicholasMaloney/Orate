import { expect, test } from "@playwright/test";

// Verifies the create, read, update, and delete functionality of Orates Library user interface

test("teacher completes word-list CRUD", async ({
    page,
}) => {
    const uniqueName = `Playwright list ${Date.now()}`;
    const updatedName = `${uniqueName} updated`;
    const description = "Created by the Assignment 3 Playwright workflow."

    // Opens the Content Library using the base URL from playwright.config.ts
    await page.goto("/library");

    // Waits until the initial word-list has loaded - uses a Regex expression
    await expect(
        page.getByText(
            /\d+ word lists loaded\./,
        ),
    ).toBeAttached();

    // Opens the form used to create a new word list.
    await page.getByRole("button", { name: "New word list" }).click();

    // Enters valid values using the form control lables e.g. List name, Desciption
    await page.getByLabel("List name").fill(uniqueName);

    await page.getByLabel(/^Description/).fill(description);

    // Submits the 'create a word list' form and creates the database record. - This test the 'Create' part of CRUD
    await page.getByRole("button",
        {
            name: "Create word list",
        }
    ).click();

    // Confirms that the application reports a successful creation.
    await expect(page.getByText(`${uniqueName} was created.`,
        {
            exact: true,
        },),
    ).toBeVisible();

    // Verifies that the new record is displayed in the library. Tests the 'Read' part of CRUD
    const createdListCard =
        page.getByRole("article").filter({
            has: page.getByRole("heading", {
                name: uniqueName,
                exact: true,
            }),
        });

    await expect(
        createdListCard,
    ).toBeVisible();

    // Checks the description only inside the newly created card.
    await expect(
        createdListCard.getByText(
            description,
            {
                exact: true,
            },
        ),
    ).toBeVisible();

    // Clicks the 'edit list' button for the newly created list.
    await page.getByRole("button",
        {
            name: `Edit list ${uniqueName}`,
            exact: true,
        }
    ).click();

    // Changes the name while leaving the existing description - This tests the 'Update' part of CRUD
    await page.getByLabel("List name").fill(updatedName);

    // Saves the updated record.
    await page.getByRole("button", { name: "Save changes", }).click();

    // Confirms that the application reports a successful update.
    await expect(
        page.getByText(
            `${updatedName} was updated.`,
            {
                exact: true,
            },
        ),
    ).toBeVisible();

    // Verifies that the updated name is displayed.
    await expect(page.getByRole("heading",
        {
            name: updatedName,
            exact: true,
        }),
    ).toBeVisible();

    // Starts listening for the confirmation dialog before clicking delete
    const dialogPromise = page.waitForEvent("dialog");

    const deletePromise = page.getByRole("button",
        {
            name: `Delete list ${updatedName}`,
            exact: true,
        }).click();

    const dialog = await dialogPromise;

    // Verifies that the browser displayed the expected confirmation and correct word list.
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain(updatedName,);

    // Accepts the confirmation and waits for the original click operation to finish.
    await dialog.accept();
    await deletePromise;

    // Confirms that the application reports a successful deletion. This test the 'Delete' part of CRUD.
    await expect(page.getByText(
        `${updatedName} was deleted.`,
        {
            exact: true,
        },
    ),
    ).toBeVisible();

    // Verifies that the deleted record no longer appears in the UI.
    await expect(
        page.getByRole("heading", {
            name: updatedName,
            exact: true,
        }),
    ).toHaveCount(0);

});