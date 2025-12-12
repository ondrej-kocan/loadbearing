import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loadbearing - Renovation Planning",
  description: "A homeowner-focused renovation planning web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
