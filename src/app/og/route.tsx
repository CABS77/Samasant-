import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export function GET() {
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#faf8f4', color: '#204e40', width: '100%', height: '100%', padding: 80, borderBottom: '18px solid #204e40' }}>
    <div style={{ fontSize: 28, marginBottom: 48, letterSpacing: 5 }}>SAMA SANTÉ · SÉNÉGAL</div>
    <div style={{ fontSize: 78, fontWeight: 700 }}>Votre santé,</div>
    <div style={{ fontSize: 78, fontWeight: 700, color: '#895033' }}>plus proche de vous.</div>
    <div style={{ fontSize: 26, marginTop: 44 }}>Information et accès aux soins · Français & Wolof</div>
  </div>, { width: 1200, height: 630 });
}
