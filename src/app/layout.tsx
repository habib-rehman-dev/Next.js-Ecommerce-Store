import { Raleway, Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Our Store",
  description: "Modern storefront and admin dashboard",
};
// app/layout.tsx

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <html
        className={`${raleway.variable} ${geist.variable} ${geistMono.variable}`}
      >
        <body>
          {children}
          <Toaster/>
        </body>
      </html>
    </ClerkProvider>
  );
}
