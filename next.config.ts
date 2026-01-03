import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  images: {
    remotePatterns: [
      {
        // 1. 비핸스 프로필 및 아도비 서비스 이미지 서버 (추가됨)
        protocol: 'https',
        hostname: 'pps.services.adobe.com',
        pathname: '/**',
      },
      {
        // 2. 비핸스 메인 이미지 서버
        protocol: 'https',
        hostname: 'mir-s3-cdn-cf.behance.net',
        pathname: '/**',
      },
      {
        // 3. 비핸스 추가 에셋 서버
        protocol: 'https',
        hostname: 'a5.behance.net',
        pathname: '/**',
      },
      {
        // 4. 네이버 이미지 서버
        protocol: 'https',
        hostname: '*.naver.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.pstatic.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;