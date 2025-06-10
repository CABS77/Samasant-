'use server';

import { LRUCache } from 'lru-cache';

interface UnsplashImage {
  urls: {
    small: string;
    regular: string;
  };
  alt_description: string;
}

interface PexelsPhoto {
  src: {
    medium: string;
    large: string;
  };
  alt: string;
}

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

// Cache pour stocker les URLs d'images ("" signifie absence d'image)
const imageCache = new LRUCache<string, string>({
  max: 500, // Maximum 500 entrées
  ttl: 1000 * 60 * 60 * 24 * 7, // TTL de 7 jours
});

// Validation des clés API au démarrage
function validateApiKeys() {
  const errors: string[] = [];
  
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY_PLACEHOLDER') {
    errors.push('UNSPLASH_ACCESS_KEY is not configured or using placeholder');
  }
  
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_PLACEHOLDER') {
    errors.push('PEXELS_API_KEY is not configured or using placeholder');
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Image Service API Keys Warning:', errors.join(', '));
  }
  
  return errors.length === 0;
}

// Valider les clés au démarrage
validateApiKeys();

async function fetchImageFromUnsplash(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY_PLACEHOLDER') {
    console.warn('Unsplash API key is not configured or is using a generic placeholder. Skipping Unsplash search. Query was:', query);
    return null;
  }
  
  try {
    console.log(`Searching Unsplash for: ${query} with key: ${UNSPLASH_ACCESS_KEY ? '**********' : 'NOT SET'}`);
    const response = await fetch(`${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Unsplash API error for query "${query}": ${response.status} ${response.statusText}. Body: ${errorText}`);
      
      // Si c'est une erreur 401, la clé est invalide
      if (response.status === 401) {
        console.error('❌ Unsplash API key is invalid. Please check your NEXT_PUBLIC_UNSPLASH_ACCESS_KEY');
      }
      
      return null;
    }
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      console.log(`Unsplash found image for "${query}": ${data.results[0].urls.small}`);
      return data.results[0].urls.small;
    }
    
    console.log(`No results from Unsplash for: ${query}`);
    return null;
  } catch (error: any) {
    console.error(`Network error or other issue fetching from Unsplash for query "${query}":`, error.message);
    return null;
  }
}

async function fetchImageFromPexels(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_PLACEHOLDER') {
    console.warn('Pexels API key is not configured or is using a generic placeholder. Skipping Pexels search. Query was:', query);
    return null;
  }
  
  try {
    console.log(`Searching Pexels for: ${query} with key: ${PEXELS_API_KEY ? '**********' : 'NOT SET'}`);
    const response = await fetch(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pexels API error for query "${query}": ${response.status} ${response.statusText}. Body: ${errorText}`);
      
      // Si c'est une erreur 401, la clé est invalide
      if (response.status === 401) {
        console.error('❌ Pexels API key is invalid. Please check your NEXT_PUBLIC_PEXELS_API_KEY');
      }
      
      return null;
    }
    
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      console.log(`Pexels found image for "${query}": ${data.photos[0].src.medium}`);
      return data.photos[0].src.medium;
    }
    
    console.log(`No results from Pexels for: ${query}`);
    return null;
  } catch (error: any) {
    console.error(`Network error or other issue fetching from Pexels for query "${query}":`, error.message);
    return null;
  }
}

export async function getRemedyImageUrl(query: string): Promise<string | null> {
  if (!query || query.trim() === "") {
    console.warn("Empty query provided for image search. Returning null.");
    return null;
  }
  
  console.log(`getRemedyImageUrl called with query: "${query}"`);
  
  // Vérifier le cache d'abord
  const cachedUrl = imageCache.get(query);
  if (cachedUrl !== undefined) {
    console.log(`✅ Cache hit for query "${query}": ${cachedUrl}`);
    return cachedUrl || null;
  }
  
  console.log(`❌ Cache miss for query "${query}". Fetching from APIs...`);
  
  // Try Unsplash first
  let imageUrl = await fetchImageFromUnsplash(query);
  if (imageUrl) {
    imageCache.set(query, imageUrl);
    return imageUrl;
  }
  
  // If Unsplash fails or returns no image, try Pexels
  console.log(`No image found for query: "${query}" on Unsplash. Trying Pexels...`);
  imageUrl = await fetchImageFromPexels(query);
  if (imageUrl) {
    imageCache.set(query, imageUrl);
    return imageUrl;
  }
  
  console.warn(`No image found for query: "${query}" on Unsplash or Pexels. Returning null as fallback.`);
  
  // Mettre en cache le résultat vide pour éviter de refaire les appels API
  imageCache.set(query, "");
  return null;
}

// Fonction utilitaire pour effacer le cache (utile pour les tests ou la maintenance)
export async function clearImageCache() {
  imageCache.clear();
  console.log('Image cache cleared');
}

// Fonction pour obtenir les statistiques du cache
export async function getImageCacheStats() {
  return {
    size: imageCache.size,
    maxSize: imageCache.max,
    ttl: imageCache.ttl,
  };
}
