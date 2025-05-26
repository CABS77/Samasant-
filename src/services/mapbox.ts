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
   * The coordinates of the clinic.
   */
  coordinate: Coordinate;
  /**
   * The name of the clinic.
   */
  name: string;
}

/**
 * Retrieves nearby clinics based on a given coordinate.
 *
 * @param coordinate The coordinate to search for nearby clinics.
 * @returns A promise that resolves to an array of Clinic objects.
 */
export async function getNearbyClinics(coordinate: Coordinate): Promise<Clinic[]> {
  // TODO: Implement this by calling an API.
  return [
    {
      coordinate: { latitude: 14.7167, longitude: -17.4677 },
      name: 'Dakar Medical Center',
    },
    {
      coordinate: { latitude: 14.6928, longitude: -17.4467 },
      name: 'Hopital Principal de Dakar',
    },
  ];
}
