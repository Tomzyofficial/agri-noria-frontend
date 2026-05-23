'use client';
import Link from 'next/link';

export function ProviderCard({ provider }) {
  return (
    <Link href={`/farming/providers/${provider.slug}`} className="block group">
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #E8DDD0',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(44,26,14,0.06)',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(44,26,14,0.14)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(44,26,14,0.06)';
        }}
      >
        {/* Cover strip */}
        <div style={{
          height: '8px',
          background: provider.is_featured
            ? 'linear-gradient(90deg, #3D6B45, #C8873A)'
            : 'linear-gradient(90deg, #8B5E3C, #C8873A)',
        }} />

        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #3D6B45, #6A9B5F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFF', fontSize: '22px', fontWeight: '700', fontFamily: 'Playfair Display, serif',
              flexShrink: 0
            }}>
              {provider.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {provider.is_verified && (
                <span style={{
                  background: '#EBF5EB', color: '#3D6B45', fontSize: '11px', fontWeight: '600',
                  padding: '3px 8px', borderRadius: '99px', border: '1px solid #9DC07A'
                }}>✓ Verified</span>
              )}
              {provider.is_featured && (
                <span style={{
                  background: '#FDF3E3', color: '#C8873A', fontSize: '11px', fontWeight: '600',
                  padding: '3px 8px', borderRadius: '99px', border: '1px solid #E8A84C'
                }}>★ Featured</span>
              )}
            </div>
          </div>

          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', color: '#2C1A0E', marginBottom: '4px' }}>
            {provider.name}
          </h3>
          <p style={{ color: '#8B5E3C', fontSize: '13px', marginBottom: '10px' }}>
            📍 {provider.location}
          </p>
          <p style={{ color: '#5C3D1E', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
            {provider.tagline}
          </p>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
            background: '#FAF5EC', borderRadius: '10px', padding: '12px', marginBottom: '14px'
          }}>
            {[
              { label: 'Services', value: provider.service_count || 0 },
              { label: 'Projects', value: provider.portfolio_count || 0 },
              { label: 'Certs', value: provider.cert_count || 0 },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '700', color: '#2C1A0E' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: '#8B5E3C' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Rating & response */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#E8A84C', fontSize: '14px' }}>{'★'.repeat(Math.round(provider.rating || 0))}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2C1A0E' }}>{Number(provider.rating || 0).toFixed(1)}</span>
              <span style={{ fontSize: '12px', color: '#8B5E3C' }}>({provider.review_count})</span>
            </div>
            <span style={{ fontSize: '12px', color: '#6A9B5F', fontWeight: '500' }}>
              {provider.response_time}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ServiceCard({ service, showProvider = true }) {
  const formatPrice = (min, max, unit, currency) => {
    if (!min && !max) return 'Request quote';
    const fmt = n => new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency || 'NGN', maximumFractionDigits: 0 }).format(n);
    if (min && max) return `${fmt(min)} – ${fmt(max)} ${unit || ''}`;
    if (min) return `From ${fmt(min)} ${unit || ''}`;
    return `Up to ${fmt(max)} ${unit || ''}`;
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '14px',
      border: '1px solid #E8DDD0',
      padding: '22px',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(44,26,14,0.10)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #F2D078, #C8873A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
        }}>🌾</div>
        <div style={{ flex: 1 }}>
          <span style={{
            display: 'inline-block', fontSize: '11px', fontWeight: '600',
            color: '#3D6B45', background: '#EBF5EB', padding: '2px 8px',
            borderRadius: '99px', marginBottom: '4px'
          }}>
            {service.category_name}
          </span>
          <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: '700', color: '#2C1A0E', lineHeight: '1.3' }}>
            {service.title}
          </h4>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: '#5C3D1E', lineHeight: '1.6', marginBottom: '14px' }}>
        {service.description.substring(0, 160)}...
      </p>

      {/* Details */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {service.min_acreage && (
          <span style={{ fontSize: '12px', color: '#8B5E3C', background: '#FAF5EC', padding: '3px 10px', borderRadius: '99px' }}>
            {service.min_acreage}+ ha
          </span>
        )}
        {service.turnaround_days && (
          <span style={{ fontSize: '12px', color: '#8B5E3C', background: '#FAF5EC', padding: '3px 10px', borderRadius: '99px' }}>
            ~{service.turnaround_days} days
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px solid #F0E8DC', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#2C1A0E' }}>
            {formatPrice(service.price_min, service.price_max, service.price_unit, service.currency)}
          </div>
          {showProvider && (
            <div style={{ fontSize: '12px', color: '#8B5E3C' }}>by {service.provider_name}</div>
          )}
        </div>
        {showProvider && (
          <Link href={`/farming/providers/${service.provider_slug}`}
            style={{
              fontSize: '12px', fontWeight: '600', color: '#3D6B45',
              textDecoration: 'none', padding: '6px 14px',
              border: '1px solid #9DC07A', borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3D6B45'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3D6B45'; }}
          >
            View Provider
          </Link>
        )}
      </div>
    </div>
  );
}

export function StatBadge({ value, label, icon }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: '900', color: '#2C1A0E', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', color: '#8B5E3C', marginTop: '4px' }}>{label}</div>
    </div>
  );
}
