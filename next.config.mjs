/** @type {import('next').NextConfig} */

// Base path is set via env var so local dev (`npm run dev`) runs at "/"
// while CI builds for GitHub Pages set NEXT_PUBLIC_BASE_PATH=/anmol-portfolio.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
