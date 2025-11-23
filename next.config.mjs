/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },

    async rewrites() {
        return [
            {
                source: "/api/gas/:path*",
                destination: "https://script.google.com/macros/s/AKfycbxCzevWMZBXjVjkx57KtifIiYh3B4rAgIJ7n2W-dZeLWHYfdMkQ4FFKw95sdsMaQD3a/exec",
            },
        ];
    },
};

export default nextConfig;
