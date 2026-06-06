import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

async function generate() {
  // Logo SVG - arka plan rect'ini kaldırarak şeffaf yap
  const logoSvg = readFileSync('public/kurgemx-logo-dark.svg', 'utf-8');
  const logoTransparent = logoSvg.replace(
    /<rect width="280" height="72" fill="#0d0d18"\/>/,
    ''
  );
  const logoBuffer = await sharp(Buffer.from(logoTransparent)).png().toBuffer();

  const mainSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <!-- Arka plan -->
    <rect width="1200" height="630" fill="#1F3864"/>

    <!-- Sol/sağ ayırıcı -->
    <line x1="740" y1="40" x2="740" y2="600"
          stroke="white" stroke-opacity="0.12" stroke-width="1"/>

    <!-- Başlık -->
    <text x="80" y="248"
          font-family="Arial, sans-serif" font-weight="bold" font-size="32"
          fill="white">AI-Powered Business Analysis Platform</text>

    <!-- Alt başlık -->
    <text x="80" y="302"
          font-family="Arial, sans-serif" font-size="19"
          fill="white" fill-opacity="0.6">Story maps · Analysis documents · Prototypes · Test scenarios</text>

    <!-- Buton -->
    <rect x="80" y="366" width="198" height="46" rx="8" fill="#2E75B6"/>
    <text x="179" y="395"
          font-family="Arial, sans-serif" font-weight="bold" font-size="18"
          fill="white" text-anchor="middle">kurgemx.com</text>

    <!-- Powered by -->
    <text x="80" y="590"
          font-family="Arial, sans-serif" font-size="14"
          fill="white" fill-opacity="0.35">Powered by Claude AI</text>

    <!-- Kart 1: Hikaye Haritası -->
    <rect x="775" y="52" width="388" height="158" rx="12"
          fill="white" fill-opacity="0.08"
          stroke="white" stroke-opacity="0.18" stroke-width="1"/>
    <text x="800" y="90"
          font-family="Arial, sans-serif" font-weight="bold" font-size="17"
          fill="white">&#128507; Hikaye Haritas&#305;</text>
    <text x="800" y="117"
          font-family="Arial, sans-serif" font-size="13"
          fill="white" fill-opacity="0.55">Story Maps</text>
    <text x="800" y="142"
          font-family="Arial, sans-serif" font-size="12"
          fill="white" fill-opacity="0.38">Kullan&#305;c&#305; yolculuklar&#305;n&#305; g&#246;rselle&#351;tir</text>

    <!-- Kart 2: Gereksinim Analizi -->
    <rect x="775" y="232" width="388" height="158" rx="12"
          fill="white" fill-opacity="0.08"
          stroke="white" stroke-opacity="0.18" stroke-width="1"/>
    <text x="800" y="270"
          font-family="Arial, sans-serif" font-weight="bold" font-size="17"
          fill="white">&#128203; Gereksinim Analizi</text>
    <text x="800" y="297"
          font-family="Arial, sans-serif" font-size="13"
          fill="white" fill-opacity="0.55">Requirements Analysis</text>
    <text x="800" y="322"
          font-family="Arial, sans-serif" font-size="12"
          fill="white" fill-opacity="0.38">Detayl&#305; i&#351; analizi dok&#252;manlar&#305;</text>

    <!-- Kart 3: Prototip & Test -->
    <rect x="775" y="412" width="388" height="158" rx="12"
          fill="white" fill-opacity="0.08"
          stroke="white" stroke-opacity="0.18" stroke-width="1"/>
    <text x="800" y="450"
          font-family="Arial, sans-serif" font-weight="bold" font-size="17"
          fill="white">&#129514; Prototip &amp; Test Senaryosu</text>
    <text x="800" y="477"
          font-family="Arial, sans-serif" font-size="13"
          fill="white" fill-opacity="0.55">Prototype &amp; Test Scenarios</text>
    <text x="800" y="502"
          font-family="Arial, sans-serif" font-size="12"
          fill="white" fill-opacity="0.38">H&#305;zl&#305; prototip ve test planlar&#305;</text>
  </svg>`;

  await sharp(Buffer.from(mainSvg))
    .composite([{ input: logoBuffer, left: 80, top: 60 }])
    .png()
    .toFile('public/og-image.png');

  console.log('✓ public/og-image.png oluşturuldu (1200x630)');
}

generate().catch(err => {
  console.error('Hata:', err.message);
  process.exit(1);
});
