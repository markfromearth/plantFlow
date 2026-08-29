const sharp = require('sharp');

async function check() {
  const img1 = '/Users/trinity/.gemini/antigravity/brain/5810e3ec-25e3-4224-ad3a-e9582e0e73c1/.user_uploaded/media_1787912005628.png';
  const img2 = '/Users/trinity/.gemini/antigravity/brain/5810e3ec-25e3-4224-ad3a-e9582e0e73c1/.user_uploaded/media_1787912015156.png';

  const meta1 = await sharp(img1).metadata();
  console.log('media_1787912005628.png size:', meta1.width, 'x', meta1.height);

  const meta2 = await sharp(img2).metadata();
  console.log('media_1787912015156.png size:', meta2.width, 'x', meta2.height);
}

check().catch(console.error);
