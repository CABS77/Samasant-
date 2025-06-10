"use client";

import { useEffect, useState } from 'react';
import { Map } from './map';
import { getNearbyClinics, Clinic } from '@/services/mapbox';

export function ClinicLocator() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const data = await getNearbyClinics({ latitude, longitude });
          setClinics(data);
        } catch {
          setError('Impossible de charger les cliniques');
        }
      },
      () => setError('Impossible de récupérer votre position')
    );
  }, []);

  if (error) return <p>{error}</p>;
  if (!coords) return <p>Recherche de votre position...</p>;

  return <Map latitude={coords.lat} longitude={coords.lng} clinics={clinics} />;
}
