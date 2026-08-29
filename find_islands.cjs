const sharp = require('sharp');
const fs = require('fs');

async function main() {
  const imgPath = '/Users/trinity/.gemini/antigravity/brain/5810e3ec-25e3-4224-ad3a-e9582e0e73c1/.user_uploaded/media_1787912015156.png';
  const image = sharp(imgPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // We want to find contiguous groups of non-white pixels.
  // White is defined as R > 250, G > 250, B > 250.
  const visited = new Uint8Array(width * height);
  const boxes = [];

  function isNonWhite(x, y) {
    const idx = (y * width + x) * channels;
    // Check if within bounds
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    // Check channels (RGBA or RGB)
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // If it has alpha channel, check alpha too
    if (channels === 4 && data[idx + 3] < 10) return false; // transparent
    return (r < 250 || g < 250 || b < 250);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited[y * width + x] === 0 && isNonWhite(x, y)) {
        // BFS to find all connected non-white pixels
        let minX = x, maxX = x, minY = y, maxY = y;
        const queue = [[x, y]];
        visited[y * width + x] = 1;

        let head = 0;
        while (head < queue.length) {
          const [cx, cy] = queue[head++];
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // Check 4 neighbors
          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (visited[nidx] === 0 && isNonWhite(nx, ny)) {
                visited[nidx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }

        // Only keep clusters that are sufficiently large
        if ((maxX - minX > 20) && (maxY - minY > 20)) {
          boxes.push({ minX, maxX, minY, maxY, size: queue.length });
        }
      }
    }
  }

  console.log(`Found ${boxes.length} clusters:`);
  boxes.forEach((box, i) => {
    console.log(`Cluster ${i}: x=[${box.minX}, ${box.maxX}] y=[${box.minY}, ${box.maxY}] width=${box.maxX - box.minX} height=${box.maxY - box.minY} size=${box.size}`);
  });

  // Let's crop each box and save it to public/images/category_*.png
  const outputDir = '/Users/trinity/Documents/MEM Digital/GitHub/plantFlow/public/images';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    // Add padding around the bounding box
    const padding = 15;
    const cropX = Math.max(0, box.minX - padding);
    const cropY = Math.max(0, box.minY - padding);
    const cropW = Math.min(width - cropX, (box.maxX - box.minX) + 2 * padding);
    const cropH = Math.min(height - cropY, (box.maxY - box.minY) + 2 * padding);

    await sharp(imgPath)
      .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
      .toFile(`${outputDir}/cat_toy_${i}.png`);
    
    console.log(`Saved cat_toy_${i}.png`);
  }
}

main().catch(console.error);
