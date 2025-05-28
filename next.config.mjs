import nextPWA from 'next-pwa';
import { join } from 'path';

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  devIndicators: false
  // Diğer Next.js ayarların varsa buraya yaz
};

export default withPWA(nextConfig);
