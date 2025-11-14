// src/app/page.js
// Ini adalah Server Component, sehingga fetching data akan dieksekusi di server.
import ProductCard from '../components/ProductCard';
import { fetchProductsFromSheet } from '../lib/google-sheets';

// Mengatur agar halaman ini di-revalidate setiap 3600 detik (1 jam)
// untuk mendapatkan data terbaru dari Google Sheet tanpa deployment baru.
export const revalidate = 3600; 

export default async function HomePage() {
    // Memanggil fungsi fetching data
    const products = await fetchProductsFromSheet();
    
    return (
        <section className="py-6">
            <h1 className="text-4xl font-extrabold mb-8 text-primary">Katalog TokoKU</h1>

            {products.length === 0 ? (
                <div className="text-center p-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Maaf, data produk tidak dapat dimuat atau kosong.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">
                        Periksa konfigurasi di file `.env.local` dan pastikan Google Sheets Anda sudah di-share.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map(product => (
                        <ProductCard key={product.id || product.name} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}