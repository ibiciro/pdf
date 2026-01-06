/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    // Allow Tempo platform to access the dev server
    ...(process.env.TEMPO === "true" && {
        experimental: {
            // Required for Tempo platform
        },
    }),
};

module.exports = nextConfig;