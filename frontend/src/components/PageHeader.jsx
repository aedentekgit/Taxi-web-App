import React from 'react';

export default function PageHeader({ title, description, icon, statLabel, statValue, statIcon }) {
  return (
    <div className="premium-header mb-24 shadow-premium" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
      <div className="flex gap-16 items-center" style={{ position: 'relative', zIndex: 2, flex: 1, minWidth: '240px' }}>
        <div className="sidebar-logo shadow-orange shrink-0 flex items-center justify-center" style={{ width: 48, height: 48, fontSize: 20 }}>
          {icon || '📋'}
        </div>
        <div>
          <h1 className="text-24 font-black mb-4">{title}</h1>
          <p className="opacity-75 text-13">{description}</p>
        </div>
      </div>
      {(statLabel || statValue !== undefined) && (
        <div style={{ position: 'relative', zIndex: 2, flex: '0 0 auto' }}>
          <div 
            className="px-20 py-12 flex items-center justify-center gap-14" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(12px)', 
              border: '1px solid rgba(255, 255, 255, 0.15)', 
              borderRadius: '16px', 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', 
              transition: 'all 0.3s ease', 
              cursor: 'default' 
            }} 
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} 
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {statIcon && (
              <div 
                className="flex items-center justify-center rounded-full shrink-0" 
                style={{ 
                  width: '44px', height: '44px', 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  color: '#fff', 
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' 
                }}
              >
                {statIcon}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-11 uppercase font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '1.5px', marginBottom: '4px' }}>
                {statLabel}
              </span>
              <span className="text-24 font-black leading-none" style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {statValue}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
