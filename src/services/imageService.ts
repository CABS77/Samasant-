'use server';

import { LRUCache } from 'lru-cache';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

// Cache pour stocker les URLs d'images ("" signifie absence d'image)
const imageCache = new LRUCache<string, string>({
  max: 500, // Maximum 500 entrées
  ttl: 1000 * 60 * 60 * 24 * 7, // TTL de 7 jours
});

async function fetchImageFromUnsplash(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY_PLACEHOLDER') {
    return null;
  }
  
  try {
    const response = await fetch(`${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
    
    if (!response.ok) {
      await response.text();
      
      // Si c'est une erreur 401, la clé est invalide
      
      return null;
    }
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }
    
    return null;
  } catch {
    return null;
  }
}

async function fetchImageFromPexels(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_PLACEHOLDER') {
    return null;
  }
  
  try {
    const response = await fetch(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });
    
    if (!response.ok) {
      await response.text();
      
      // Si c'est une erreur 401, la clé est invalide
      
      return null;
    }
    
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.medium;
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function getRemedyImageUrl(query: string): Promise<string | null> {
  if (!query || query.trim() === "") {
    return null;
  }
  
  
  // Vérifier le cache d'abord
  const cachedUrl = imageCache.get(query);
  if (cachedUrl !== undefined) {
    return cachedUrl || null;
  }
  
  
  // Try Unsplash first
  let imageUrl = await fetchImageFromUnsplash(query);
  if (imageUrl) {
    imageCache.set(query, imageUrl);
    return imageUrl;
  }
  
  // If Unsplash fails or returns no image, try Pexels
  imageUrl = await fetchImageFromPexels(query);
  if (imageUrl) {
    imageCache.set(query, imageUrl);
    return imageUrl;
  }
  
  
  // Mettre en cache le résultat vide pour éviter de refaire les appels API
  imageCache.set(query, "");
  return null;
}

// Fonction utilitaire pour effacer le cache (utile pour les tests ou la maintenance)
export async function clearImageCache() {
  imageCache.clear();
}

// Fonction pour obtenir les statistiques du cache
export async function getImageCacheStats() {
  return {
    size: imageCache.size,
    maxSize: imageCache.max,
    ttl: imageCache.ttl,
  };
}
