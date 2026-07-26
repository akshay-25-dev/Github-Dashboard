import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "GitHub Developer Dashboard — Visual Profile Analytics",
  description:
    "Enter any GitHub username and instantly view a rich, visual summary of their activity, skills, achievements, and an AI-generated portfolio summary.",
  keywords: [
    "GitHub",
    "developer",
    "dashboard",
    "portfolio",
    "analytics",
    "contributions",
    "heatmap",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
