import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ComponentType } from 'react';

// Types pour les props du composant Map
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

// Skeleton de chargement pour la carte
function MapLoadingSkeleton() {
  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    </div>
  );
}

// Import dynamique du composant Map avec lazy loading
export const LazyMap = dynamic<MapProps>(
  () => import('@/components/map').then(mod => mod.Map as ComponentType<MapProps>),
  {
    loading: () => <MapLoadingSkeleton />,
    ssr: false, // Désactiver le SSR pour les cartes
  }
);
