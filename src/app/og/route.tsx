import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export function GET() {
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#064e3b', color: 'white', width: '100%', height: '100%', padding: 80 }}>
    <div style={{ fontSize: 84, fontWeight: 700 }}>SamaSanté</div>
    <div style={{ fontSize: 42, marginTop: 30 }}>Information et accès aux soins</div>
    <div style={{ fontSize: 30, marginTop: 35 }}>Français · Wolof · Sénégal</div>
  </div>, { width: 1200, height: 630 });
}
