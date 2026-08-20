const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'products');

function extFromContentType(contentType) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return map[contentType] || '.jpg';
}

// Descarga una imagen externa (ej: la de MakerWorld) y la guarda en
// /uploads/products, para no depender de que ese link siga vivo en el
// futuro (hotlinking). Devuelve la URL local servida por este mismo back.
async function downloadImage(imageUrl, publicBaseUrl) {
  const { data, headers } = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const ext = extFromContentType(headers['content-type']);
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filepath, data);

  return `${publicBaseUrl}/uploads/products/${filename}`;
}

module.exports = { downloadImage };
