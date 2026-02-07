import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MiniKitProvider } from "@/lib/minikit/provider";
import { WagmiContextProvider } from "@/lib/wagmi/provider";
import { AuthGuard } from "@/features/auth";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Raffle",
  description: "WorldID 인증 기반 실물 경품 복권 마켓플레이스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MiniKitProvider>
          <WagmiContextProvider initialState={undefined}>
            <AuthGuard>{children}</AuthGuard>
            <Toaster />
          </WagmiContextProvider>
        </MiniKitProvider>
      </body>
    </html>
  );
}
