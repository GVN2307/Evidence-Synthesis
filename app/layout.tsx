import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "EvidenceSynthesis - AI-Powered Research Analysis",
    description: "Analyze multiple research papers, detect contradictions, and synthesize evidence with confidence scoring.",
};

import Providers from "@/components/providers";
import { AuthInitializer } from "@/components/AuthInitializer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
                <AuthInitializer />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
