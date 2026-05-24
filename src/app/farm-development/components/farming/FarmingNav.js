'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FarmingNav() {
  const pathname = usePathname();

  const links = [
    { href: '/farming', label: 'Overview' },
    { href: '/farming/providers', label: 'Service Providers' },
    { href: '/farming/services', label: 'Browse Services' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(250,245,236,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E8DDD0',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '64px', gap: '40px' }}>
        <Link href="/farming" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🌾</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: '700', fontSize: '18px', color: '#2C1A0E' }}>
            FarmLink
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
          {links.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{
                padding: '6px 16px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '14px', fontWeight: '500',
                color: active ? '#3D6B45' : '#5C3D1E',
                background: active ? '#EBF5EB' : 'transparent',
                transition: 'all 0.2s',
              }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        <Link href="/farming/providers" style={{
          background: '#3D6B45', color: '#fff', textDecoration: 'none',
          padding: '8px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#2C5034'}
          onMouseLeave={e => e.currentTarget.style.background = '#3D6B45'}
        >
          Find Providers →
        </Link>
      </div>
    </nav>
  );
}
