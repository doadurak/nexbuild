import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/ThemeProvider";
import { CpmConsoleProvider } from "@/components/CpmConsoleProvider";
import { CopilotModalProvider } from "@/components/CopilotModalProvider";
import CopilotWidget from "@/components/CopilotWidget";
import HelpChatWidget from "@/components/HelpChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexBuild.ai — Construction Copilot",
  description: "AI-powered construction schedule risk management and decision support platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="h-full flex flex-col">
        <ThemeProvider>
          <CpmConsoleProvider>
            <CopilotModalProvider>
              {children}
              <CopilotWidget />
              <HelpChatWidget />
            </CopilotModalProvider>
          </CpmConsoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
