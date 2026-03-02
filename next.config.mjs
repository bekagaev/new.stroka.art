/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // В dev Next/Image может "оптимизировать" каждый кадр очень медленно.
    // Мы используем обычные <img> + WebP из /public, но на всякий случай выключаем оптимайзер.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
