// src/app/layout.js
import './globals.css';

export const metadata = {
  title: 'TokoKU Next.js',
  description: 'E-commerce frontend dengan Next.js, didukung Google Sheets & Drive.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-100 antialiased min-h-screen flex flex-col">
        <header className="bg-dark-bg text-white p-4 shadow-lg sticky top-0 z-10">
            <nav className="max-w-7xl mx-auto flex justify-between items-center">
                <a href="/" className="text-xl font-bold text-primary">TokoKU Next</a>
                <div className="space-x-4 text-sm">
                    {/* Link navigasi sederhana */}
                    <a href="/" className="hover:text-primary transition">Home</a>
                    <a href="/products" className="hover:text-primary transition">Produk</a>
                    <a href="/categories" className="hover:text-primary transition">Kategori</a>
                </div>
            </nav>
        </header>
        <main className="grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
            {children}
        </main>
        <footer className="mt-auto p-4 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            Dibuat dengan Next.js dan data dari Google Sheets.
        </footer>
      </body>
    </html>
  );
}