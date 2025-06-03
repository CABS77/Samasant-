import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: 'Mise à jour disponible',
                    description: 'Nouvelle version de SamaSanté disponible. Actualisez la page pour la charger.',
                  });
                }
              });
            }
          });
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    }
  }, []);
}
