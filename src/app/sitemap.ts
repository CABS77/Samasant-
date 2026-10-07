import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/app', '/appointments', '/cgu', '/confidentialite'].map(path => ({
    url: `https://www.samasante.tech${path === '/' ? '' : path}`,
  }));
}
