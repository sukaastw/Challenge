// next.config.mjs (Koreksi)

/** @type {import('next').NextConfig} */ // <--- Baris ini dihapus/dihilangkan
const nextConfig = {
    images: {
        // Harus ditambahkan agar gambar dari Google Drive dapat diakses
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com', // <--- WAJIB DITAMBAHKAN
            },
        ],
    },
};

export default nextConfig;