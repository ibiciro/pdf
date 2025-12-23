/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    allowedDevOrigins: process.env.TEMPO === "true" ? ["https://4b97c85e-1579-4fa3-9bc5-48953d2860f1.canvases.tempo.build"] : undefined,
};

module.exports = nextConfig;