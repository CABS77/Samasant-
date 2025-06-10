import React from 'react';

interface MapProps {
  latitude: number;
  longitude: number;
  clinics?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

export function Map({ latitude, longitude, clinics = [] }: MapProps) {
  const markerParams = clinics
    .map((c) => `${c.latitude},${c.longitude},blue1`)
    .join('|');
  const markers = markerParams
    ? `${latitude},${longitude},red|${markerParams}`
    : `${latitude},${longitude},red`;
  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=13&size=600x400&markers=${markers}`;
  return (
    <div className="w-full max-w-xl mx-auto">
      <img
        src={url}
        alt="Carte des cliniques proches"
        className="w-full h-auto rounded-lg shadow"
      />
    </div>
  );
}
