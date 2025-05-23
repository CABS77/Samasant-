
'use server';

// Assuming Remedy type is defined here or imported

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

  // Try Unsplash first
  let imageUrl = await fetchImageFromUnsplash(query);
  if (imageUrl) {
    return imageUrl;
  }

  // If Unsplash fails or returns no image, try Pexels
  console.log(`No image found for query: "${query}" on Unsplash. Trying Pexels...`);
  imageUrl = await fetchImageFromPexels(query);
  if (imageUrl) {
    return imageUrl;
  }
  
  console.warn(`No image found for query: "${query}" on Unsplash or Pexels. Returning null as fallback.`);
  return null; // Explicitly return null if no image found from services
}

