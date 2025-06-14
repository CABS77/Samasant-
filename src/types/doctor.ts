export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location?: string;
  bio?: string;
  available: string[];
  rating?: number;
  reviews?: number;
}
