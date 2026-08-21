const axios = require('axios');
const cheerio = require('cheerio');

function cleanTitle(rawTitle) {
  if (!rawTitle) return '';
  // MakerWorld arma el <title>/og:title como
  // "Nombre del modelo - Free 3D Print Model - MakerWorld"
  return rawTitle
    .replace(/\s*-\s*Free 3D Print Model\s*-\s*MakerWorld\s*$/i, '')
    .replace(/\s*-\s*MakerWorld\s*$/i, '')
    .trim();
}

async function scrapeMakerworld(url) {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
        Referer: 'https://makerworld.com/',
      },
      // Si MakerWorld responde con un 4xx/5xx, queremos ver el status
      // en vez de que axios tire directo al catch sin info útil.
      validateStatus: () => true,
    });

    const $ = cheerio.load(data);

    const rawTitle =
      $('meta[property="og:title"]').attr('content') || $('title').text();
    const description =
      $('meta[property="og:description"]').attr('content') || '';
    const image_url = $('meta[property="og:image"]').attr('content') || '';

    const name = cleanTitle(rawTitle);

    if (!name) {
      // Llegamos a la página pero no pudimos leer los metadatos esperados:
      // probablemente MakerWorld nos devolvió una página de bloqueo/CAPTCHA
      // en vez del modelo real.
      throw new Error(
        'No se encontraron los datos del modelo en la página (posible bloqueo de MakerWorld).'
      );
    }

    return {
      name,
      description: description.trim(),
      image_url,
      makerworld_url: url,
    };
  } catch (error) {
    // Logueamos el error real en la consola del servidor para poder
    // diagnosticar (403 = bloqueado, ENOTFOUND = URL mal escrita,
    // ECONNABORTED = timeout, etc.). El mensaje que ve el usuario
    // en el frontend sigue siendo genérico.
    console.error('[scrapeMakerworld] URL:', url);
    console.error('[scrapeMakerworld] Error:', error.message);
    if (error.response) {
      console.error('[scrapeMakerworld] Status:', error.response.status);
    }
    if (error.code) {
      console.error('[scrapeMakerworld] Code:', error.code);
    }

    throw new Error('Error al extraer datos de MakerWorld');
  }
}

const axios = require('axios');
const cheerio = require('cheerio');

function cleanTitle(rawTitle) {
  if (!rawTitle) return '';

  return rawTitle
    .replace(/\s*-\s*Free 3D Print Model\s*-\s*MakerWorld\s*$/i, '')
    .replace(/\s*-\s*MakerWorld\s*$/i, '')
    .trim();
}


function extractGalleryImages($) {
  const seen = new Map(); // hash -> url

  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (!src) return;

    const match = src.match(/\/design\/([a-zA-Z0-9]+)\.(png|jpe?g|webp)/i);
    if (!match) return;

    const hash = match[1];
    if (seen.has(hash)) return;

    const [baseUrl] = src.split('?');
    seen.set(hash, `${baseUrl}?x-oss-process=image/resize,w_1200/format,webp`);
  });

  return Array.from(seen.values());
}

async function scrapeMakerworld(url) {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
        Referer: 'https://makerworld.com/',
      },
      // Si MakerWorld responde con un 4xx/5xx, queremos ver el status
      // en vez de que axios tire directo al catch sin info útil.
      validateStatus: () => true,
    });

    const $ = cheerio.load(data);

    const rawTitle =
      $('meta[property="og:title"]').attr('content') || $('title').text();
    const description =
      $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';

    const name = cleanTitle(rawTitle);

    if (!name) {
      // Llegamos a la página pero no pudimos leer los metadatos esperados:
      // probablemente MakerWorld nos devolvió una página de bloqueo/CAPTCHA
      // en vez del modelo real.
      throw new Error(
        'No se encontraron los datos del modelo en la página (posible bloqueo de MakerWorld).'
      );
    }

    // Todas las fotos de la galería del modelo (además de la de portada).
    // Si por lo que sea no encontramos ninguna en el HTML, al menos dejamos
    // la de og:image para no romper el flujo existente.
    const images = extractGalleryImages($);
    if (images.length === 0 && ogImage) {
      images.push(ogImage);
    }

    // image_url se mantiene por compatibilidad: es la que se usa por default
    // si el frontend no deja elegir. Preferimos la primera foto de la
    // galería (suele coincidir con la portada) y si no, la de og:image.
    const image_url = images[0] || ogImage;

    return {
      name,
      description: description.trim(),
      image_url,
      images,
      makerworld_url: url,
    };
  } catch (error) {
    // Logueamos el error real en la consola del servidor para poder
    // diagnosticar (403 = bloqueado, ENOTFOUND = URL mal escrita,
    // ECONNABORTED = timeout, etc.). El mensaje que ve el usuario
    // en el frontend sigue siendo genérico.
    console.error('[scrapeMakerworld] URL:', url);
    console.error('[scrapeMakerworld] Error:', error.message);
    if (error.response) {
      console.error('[scrapeMakerworld] Status:', error.response.status);
    }
    if (error.code) {
      console.error('[scrapeMakerworld] Code:', error.code);
    }

    throw new Error('Error al extraer datos de MakerWorld');
  }
}

module.exports = { scrapeMakerworld };