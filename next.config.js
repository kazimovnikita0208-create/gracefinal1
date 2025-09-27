/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  // Конфигурация для Telegram Web App
  assetPrefix: process.env.NODE_ENV === 'production' ? '/client-app' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/client-app' : '',
  trailingSlash: true,
  
  // Headers для Telegram Web App
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://web.telegram.org",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
