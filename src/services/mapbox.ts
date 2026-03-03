/**
 * Represents a geographical coordinate.
 */
export interface Coordinate {
  /**
   * The latitude of the coordinate.
   */
  latitude: number;
  /**
   * The longitude of the coordinate.
   */
  longitude: number;
}

/**
 * Represents a clinic with its coordinates and name.
 */
export interface Clinic {
  /**
   * Unique identifier for the clinic.
   */
  id: string;
  /**
   * The coordinates of the clinic.
   */
  coordinate: Coordinate;
  /**
   * The latitude of the clinic (for backward compatibility).
   */
  latitude: number;
  /**
   * The longitude of the clinic (for backward compatibility).
   */
  longitude: number;
  /**
   * The name of the clinic.
   */
  name: string;
  /**
   * The phone number of the clinic.
   */
  phoneNumber: string;
}

/**
 * Retrieves nearby clinics based on a given coordinate using Mapbox API.
 *
 * @param coordinate The coordinate to search for nearby clinics.
 * @returns A promise that resolves to an array of Clinic objects.
 */
export async function getNearbyClinics(coordinate: Coordinate): Promise<Clinic[]> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Si le token Mapbox n'est pas configuré, retourner des données mockées
  if (!mapboxToken) {
    console.warn('⚠️ Mapbox token not configured. Returning mock data.');
    return [
      {
        id: 'mock-1',
        coordinate: { latitude: 14.7167, longitude: -17.4677 },
        latitude: 14.7167,
        longitude: -17.4677,
        name: 'Dakar Medical Center',
        phoneNumber: '+221770000001',
      },
      {
        id: 'mock-2',
        coordinate: { latitude: 14.6928, longitude: -17.4467 },
        latitude: 14.6928,
        longitude: -17.4467,
        name: 'Hopital Principal de Dakar',
        phoneNumber: '+221770000002',
      },
      {
        id: 'mock-3',
        coordinate: { latitude: 14.7500, longitude: -17.4500 },
        latitude: 14.7500,
        longitude: -17.4500,
        name: 'Centre de Santé Almadies',
        phoneNumber: '+221770000003',
      },
    ];
  }

  try {
    // Recherche de points d'intérêt de type "hospital" ou "clinic" via Mapbox Geocoding API
    const searchTypes = ['hospital', 'clinic', 'health'];
    const radius = 5000; // 5km de rayon
    const limit = 10;

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchTypes.join(',')}.json?proximity=${coordinate.longitude},${coordinate.latitude}&limit=${limit}&access_token=${mapboxToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transformer les résultats Mapbox en format Clinic
    const clinics: Clinic[] = data.features.map((feature: any, index: number) => {
      const [lng, lat] = feature.center;
      return {
        id: feature.id || `clinic-${index}`,
        coordinate: { latitude: lat, longitude: lng },
        latitude: lat,
        longitude: lng,
        name: feature.text || feature.place_name || 'Clinique',
        phoneNumber: feature.properties?.phone || '+221770000000', // Placeholder si pas de téléphone
      };
    });

    console.log(`✅ Found ${clinics.length} clinics near coordinates`);
    return clinics;
  } catch (error: any) {
    console.error('❌ Failed to fetch clinics from Mapbox:', error.message);
    // En cas d'erreur, retourner des données mockées
    return [
      {
        id: 'fallback-1',
        coordinate: { latitude: 14.7167, longitude: -17.4677 },
        latitude: 14.7167,
        longitude: -17.4677,
        name: 'Dakar Medical Center',
        phoneNumber: '+221770000001',
      },
      {
        id: 'fallback-2',
        coordinate: { latitude: 14.6928, longitude: -17.4467 },
        latitude: 14.6928,
        longitude: -17.4467,
        name: 'Hopital Principal de Dakar',
        phoneNumber: '+221770000002',
      },
    ];
  }
}
