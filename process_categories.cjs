const sharp = require('sharp');
const fs = require('fs');

async function processImage(srcPath, outPath, cropBox = null, padding = 30) {
  let img = sharp(srcPath);

  if (cropBox) {
    // Add padding to the crop box
    const { minX, maxX, minY, maxY } = cropBox;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    
    // Get image dimensions to clamp width and height
    const meta = await sharp(srcPath).metadata();
    const cropW = Math.min(meta.width - cropX, (maxX - minX) + 2 * padding);
    const cropH = Math.min(meta.height - cropY, (maxY - minY) + 2 * padding);

    img = img.extract({ left: cropX, top: cropY, width: cropW, height: cropH });
  }

  // To make it a square layout, we pad it to a square with a white background.
  // Airbnb style from the uploaded image is a light grey background (or white/very light grey).
  // Let's look at the Airbnb reference: it has a very light grey background (#f7f7f7 or similar).
  // Let's use #f5f5f5 or #fafafa or #f7f7f7. The image has a light grey background.
  // Let's use #f7f7f7 for the square background to match the Airbnb reference.
  const size = 300;
  await img
    .resize({
      width: size - 40,
      height: size - 40,
      fit: 'contain',
      background: { r: 247, g: 247, b: 247, alpha: 1 }
    })
    .extend({
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
      background: { r: 247, g: 247, b: 247, alpha: 1 }
    })
    .toFile(outPath);

  console.log(`Saved ${outPath}`);
}

async function main() {
  const excPath = '/Users/trinity/.gemini/antigravity/brain/5810e3ec-25e3-4224-ad3a-e9582e0e73c1/.user_uploaded/media_1787912005628.png';
  const compositePath = '/Users/trinity/.gemini/antigravity/brain/5810e3ec-25e3-4224-ad3a-e9582e0e73c1/.user_uploaded/media_1787912015156.png';

  const outputDir1 = '/Users/trinity/Documents/MEM Digital/GitHub/plantFlow/public/images';
  const outputDir2 = '/Users/trinity/Documents/MEM Digital/GitHub/PlantFlowOS/public/images';

  [outputDir1, outputDir2].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 1. Process Excavator (detect bounding box first for clean cropping)
  const excMeta = await sharp(excPath).metadata();
  const excBuf = await sharp(excPath).raw().toBuffer({ resolveWithObject: true });
  let minX = excMeta.width, maxX = 0, minY = excMeta.height, maxY = 0;
  const data = excBuf.data;
  const channels = excBuf.info.channels;

  for (let y = 0; y < excMeta.height; y++) {
    for (let x = 0; x < excMeta.width; x++) {
      const idx = (y * excMeta.width + x) * channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (r < 250 || g < 250 || b < 250) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const excBox = { minX, maxX, minY, maxY };
  await processImage(excPath, `${outputDir1}/cat_toy_excavators.png`, excBox, 20);
  await processImage(excPath, `${outputDir2}/cat_toy_excavators.png`, excBox, 20);

  // 2. Process Composite Image (the 7 items)
  // We already know the cluster coordinates from our previous script:
  const categoriesMap = {
    'cat_toy_access.png': { minX: 810, maxX: 997, minY: 34, maxY: 331 },        // Cluster 0
    'cat_toy_dumpers.png': { minX: 10, maxX: 285, minY: 43, maxY: 331 },       // Cluster 1
    'cat_toy_compaction.png': { minX: 292, maxX: 554, minY: 46, maxY: 325 },   // Cluster 2
    'cat_toy_groundcare.png': { minX: 564, maxX: 816, minY: 96, maxY: 329 },   // Cluster 3
    'cat_toy_breaking.png': { minX: 452, maxX: 641, minY: 340, maxY: 631 },    // Cluster 4
    'cat_toy_floor_care.png': { minX: 646, maxX: 889, minY: 344, maxY: 646 },   // Cluster 5
    'cat_toy_power_light.png': { minX: 94, maxX: 387, minY: 364, maxY: 625 }    // Cluster 6
  };

  for (const [filename, box] of Object.entries(categoriesMap)) {
    await processImage(compositePath, `${outputDir1}/${filename}`, box, 20);
    await processImage(compositePath, `${outputDir2}/${filename}`, box, 20);
  }
  
  console.log("All category images processed successfully!");
}

main().catch(console.error);
