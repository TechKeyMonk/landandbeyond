/**
 * Image optimizer - converts PNG/JPG to WebP for all project images
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname),
  path.join(__dirname, 'public')
];

const exts = ['.png', '.jpg', '.jpeg'];

async function convertToWebP(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!exts.includes(ext)) return;
  // Skip favicons (ico stays as ico; favicon.png becomes favicon.webp)
  const webpPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  try {
    const info = await sharp(filePath)
      .webp({ quality: 85, effort: 4 })
      .toFile(webpPath);
    const origKB = Math.round(fs.statSync(filePath).size / 1024);
    const newKB = Math.round(info.size / 1024);
    const saving = Math.round((1 - newKB / origKB) * 100);
    console.log(`✅ ${path.basename(filePath)} → ${path.basename(webpPath)} | ${origKB}KB → ${newKB}KB (${saving}% saved)`);
    return webpPath;
  } catch (err) {
    console.warn(`⚠️ Could not convert ${path.basename(filePath)}: ${err.message}`);
  }
}

async function run() {
  console.log('🖼️  Converting images to WebP...\n');
  for (const dir of srcDirs) {
    const files = fs.readdirSync(dir).filter(f => exts.includes(path.extname(f).toLowerCase()));
    for (const file of files) {
      await convertToWebP(path.join(dir, file));
    }
  }
  console.log('\n✅ Image optimization complete!');
}

run();
