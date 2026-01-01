/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    allowedDevOrigins: process.env.TEMPO === "true" ? ["https://593738cd-9fe1-4ca0-a127-896e7a3a4957.canvases.tempo.build"] : undefined,
    // Allow external connections for Tempo platform
    devIndicators: {
        buildActivity: true,
    },
};

module.exports = nextConfig;