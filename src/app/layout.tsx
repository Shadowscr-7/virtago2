import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { ClientLayout } from "@/components/layout/client-layout";
import { ToastProvider } from "@/components/ui/toast";
import { ToastIntegration } from "@/components/cart/toast-integration";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Virtago - B2B E-commerce Platform",
  description:
    "Professional B2B multi-brand e-commerce platform for wholesale business",
  keywords: ["B2B", "e-commerce", "wholesale", "multi-brand", "business"],
  authors: [{ name: "Virtago Team" }],
  creator: "Virtago",
  publisher: "Virtago",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${manrope.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <ToastProvider>
            <ToastIntegration />
            <Toaster position="top-right" richColors />
            <LoadingProvider>
              <ClientLayout>{children}</ClientLayout>
            </LoadingProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
