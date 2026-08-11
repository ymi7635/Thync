// Next.js 專案設定檔（next/image 允許的外部圖片網域）
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/api/**"
      }
    ]
  }
};

export default nextConfig;
