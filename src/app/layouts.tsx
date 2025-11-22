import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Admin Dashboard",
  description: "Manajemen Produk",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}