import "./globals.css";
import NextTopLoader from "nextjs-toploader";

// IMPORT NEXT COMPONENTS
import Header from "@/app/components/header/index";
import Footer from "@/app/components/footer/index";

import localFont from 'next/font/local';
import { ClerkProvider } from "@clerk/nextjs";

// Load Sora font
const sora = localFont({
    src: '/fonts/sora-variablefont.ttf',
    variable: '--font-sora',
    display: 'swap',
});

// Load Syne font
const syne = localFont({
    src: '/fonts/syne-variablefont.ttf',
    variable: '--font-syne',
    display: 'swap',
});

// Load apercu font
const apercu = localFont({
    src: '/fonts/apercu-medium.otf',
    variable: '--font-apercu',
    display: 'swap',
});

// Load Syne font
const bebas = localFont({
    src: '/fonts/bebasneue-regular.ttf',
    variable: '--font-bebas',
    display: 'swap',
});

// Metadata for SEO
export const metadata = {

    title: "Codify Club",
    description: "Welcome to Codify Club — where opportunity meets innovation! We're a community of passionate coders, creators, and problem-solvers.",
    keywords: "coding club, programming, student coding, coding education, learn to code, coding workshops, software development, computer science, coding tutorials, tech community, student projects, coding resources, programming languages, hackathons, coding bootcamp, student support",
    authors: { name: "Shiva" },
    openGraph: {

        title: "Codify Club",
        description: "Welcome to Codify Club — where opportunity meets innovation! We're a community of passionate coders, creators, and problem-solvers.",
        url: "https://codifyclub.vercel.app",
        images: [
            {
                url: "https://codifyclub.vercel.app/og-image.jpg",
                width: 800,
                height: 600,
                alt: "Og Image Alt",
            },
        ],

    },
    twitter: {

        card: "summary_large_image",
        title: "Codify Club",
        description: "Welcome to Codify Club — where opportunity meets innovation! We're a community of passionate coders, creators, and problem-solvers.",
        images: ["https://codifyclub.vercel.app/twitter-image.jpg"],

    },
    icons: {

        icon: [
            { url: "/favicon.svg", type: "image/svg+xml" },
            { url: "/favicon.png", type: "image/png" },
        ],

    },

};

export default function RootLayout({ children }) {

    return (

        <ClerkProvider>
            <html lang="en">
                <body className={`${sora.variable} ${syne.variable} ${apercu.variable} ${bebas.variable} antialiased bg-dark`}>
                    <NextTopLoader 
                        color="#FF885B"
                        showSpinner={false}
                    />
                    <Header />
                    <main>{children}</main>
                    <Footer />
                </body>
            </html>
        </ClerkProvider>

    );

}
