import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VunaPQ — Veritas Past Questions",
  description:
    "Browse past exam questions for Veritas University, organized by department, level, course and session.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
