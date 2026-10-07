import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export function useServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
    let active = true;
    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        if (!active) return;
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (active && worker.state === 'installed' && navigator.serviceWorker.controller) toast({
              title: 'Mise à jour disponible', description: 'Actualisez la page pour charger la nouvelle version.',
            });
          });
        });
      } catch { /* Connectivity failures do not block the application. */ }
    };
    if (document.readyState === 'complete') void register();
    else window.addEventListener('load', register, { once: true });
    return () => { active = false; window.removeEventListener('load', register); };
  }, []);
}
