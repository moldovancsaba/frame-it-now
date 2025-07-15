/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['i.ibb.co', 'localhost'],
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize image processing
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif)$/i,
      use: [
        {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: {
              progressive: true,
              quality: 80
            },
            optipng: {
              enabled: true,
              optimizationLevel: 7
            },
            pngquant: {
              quality: [0.65, 0.90],
              speed: 4
            },
            gifsicle: {
              interlaced: false
            },
            webp: {
              quality: 80
            }
          }
        }
      ]
    });
    return config;
  }
};

module.exports = nextConfig;
