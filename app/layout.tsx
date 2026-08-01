import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { cookies } from "next/headers";
import { PreferenceProvider } from "@/components/preference-provider";
import { PREFERENCE_COOKIE_NAMES, preferencesFromCookies,} from "@/lib/preferences";
import { SITE_DESCRIPTION, SITE_NAME, } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The home page defaults to Orate.

export const metadata: Metadata = {
    title: {
        default:
            `${SITE_NAME} | Phoneme Activity Builder`,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
};

/**
 * The root layout is a Server Component shared by every route.
 *
 * It reads preferences before rendering so the correct theme can be included
 * in the first HTML response rather than applied after the page appears.
 */
export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();

    const themeCookie =
        cookieStore.get(
            PREFERENCE_COOKIE_NAMES.theme,
        )?.value;

    const densityCookie =
        cookieStore.get(
            PREFERENCE_COOKIE_NAMES.density,
        )?.value;

    const initialPreferences =
        preferencesFromCookies(
            themeCookie,
            densityCookie,
        );

    return (
        <html
            lang="en"
            data-theme={
                initialPreferences.theme
            }
            data-density={
                initialPreferences.density
            }
            style={{
                colorScheme:
                    initialPreferences.theme,
            }}
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col">
                <PreferenceProvider
                    initialPreferences={
                        initialPreferences
                    }
                >
                    <a
                        href="#main-content"
                        className="sr-only z-50 rounded-md bg-blue-700 px-4 py-2 text-white focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
                    >
                        Skip to main content
                    </a>

                    <SiteHeader />

                    {children}

                    <SiteFooter />
                </PreferenceProvider>
            </body>
        </html>
    );
}
