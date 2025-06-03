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
  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Carte interactive</p>
          <p className="text-sm text-gray-500">
            Latitude: {latitude.toFixed(4)}, Longitude: {longitude.toFixed(4)}
          </p>
          {clinics.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {clinics.length} clinique(s) trouvée(s)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
