
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { AuthProvider } from "../components/auth-provider";
import { Navbar } from "../components/navbar";

export const metadata = {
  title: "Major Project",
  description: "A Next.js application with Firebase integration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-primary text-primary-foreground px-3 py-2 rounded-sm shadow">Skip to content</a>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main id="main" className="pb-10 pt-4">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
