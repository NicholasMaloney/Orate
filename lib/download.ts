"use client";

/**
 * Downloads an in-memory HTML string using the browser's normal file-download
 * behavior.
 */
export function downloadHtmlFile(
    filename: string,
    html: string,
): void {
    const blob = new Blob(
        [html],
        { type: "text/html;charset=utf-8" },
    );

    const objectUrl = URL.createObjectURL(blob);
    const temporaryLink = document.createElement("a");

    temporaryLink.href = objectUrl;
    temporaryLink.download = filename;

    document.body.appendChild(temporaryLink);
    temporaryLink.click();

    window.setTimeout(() => {
        temporaryLink.remove();
        URL.revokeObjectURL(objectUrl);
    }, 1000);
}