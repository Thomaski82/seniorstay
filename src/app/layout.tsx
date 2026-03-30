import type { Metadata } from "next";
import "@/app/globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "SeniorStay",
  description: "Search and book trusted senior care homes and assisted living facilities."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
