
import "./globals.css";
export const metadata = {
  title: "Major Project",
  description: "A Next.js application with Firebase integration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
