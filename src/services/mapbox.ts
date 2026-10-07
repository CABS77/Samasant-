export interface Coordinate { latitude: number; longitude: number }
export interface Clinic {
  id: string;
  coordinate: Coordinate;
  latitude: number;
  longitude: number;
  name: string;
  phoneNumber?: string;
}

/** Directory results are for display; they are not verified emergency recipients. */
export async function getNearbyClinics(coordinate: Coordinate): Promise<Clinic[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return [];
  try {
    const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/hospital,clinic,health.json');
    url.search = new URLSearchParams({
      country: 'sn', proximity: `${coordinate.longitude},${coordinate.latitude}`, limit: '10', access_token: token,
    }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data.features)) return [];
    return data.features.flatMap((feature: {
      id?: string; text?: string; place_name?: string; center?: number[]; properties?: { phone?: string };
    }) => {
      if (!feature.id || !feature.center || feature.center.length !== 2
        || !feature.center.every(Number.isFinite)) return [];
      const [longitude, latitude] = feature.center;
      return [{
        id: feature.id, coordinate: { latitude, longitude }, latitude, longitude,
        name: feature.text || feature.place_name || 'Clinique',
        phoneNumber: feature.properties?.phone,
      }];
    });
  } catch {
    return [];
  }
}
