import React, { useState } from 'react';

// Muster Brand System - Final
// Cluster Logo Concept

const MusterBrand = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);

  const colors = {
    navy: '#1E3A5F',
    navyLight: '#2D5A87',
    amber: '#F5A623',
    amberDark: '#D4920F',
    slate: '#5A7B9A',
    slateLight: '#A8C5DB',
    success: '#2E7D4A',
    gray900: '#0F172A',
    gray500: '#64748B',
    gray200: '#CBD5E1',
    gray100: '#E8EDF2',
    offWhite: '#F8FAFC',
  };

  const copyColor = (hex, name) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(name);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  // The Cluster Logo Mark
  const LogoMark = ({ size = 64, variant = 'default' }) => {
    const dotColor = variant === 'dark' ? '#CBD5E1' : variant === 'mono' ? colors.navy : colors.navy;
    const dotOpacity = variant === 'mono' ? [0.35, 0.35, 0.35, 0.25, 0.25] : [0.4, 0.4, 0.4, 0.3, 0.3];
    const centerColor = variant === 'mono' ? colors.navy : colors.amber;
    
    if (variant === 'mono-white') {
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="10" r="5" fill="#FFFFFF" opacity="0.35"/>
          <circle cx="12" cy="32" r="5" fill="#FFFFFF" opacity="0.35"/>
          <circle cx="52" cy="32" r="5" fill="#FFFFFF" opacity="0.35"/>
          <circle cx="20" cy="50" r="4" fill="#FFFFFF" opacity="0.25"/>
          <circle cx="44" cy="50" r="4" fill="#FFFFFF" opacity="0.25"/>
          <circle cx="32" cy="32" r="10" fill="#FFFFFF"/>
        </svg>
      );
    }
    
    return (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="10" r="5" fill={dotColor} opacity={dotOpacity[0]}/>
        <circle cx="12" cy="32" r="5" fill={dotColor} opacity={dotOpacity[1]}/>
        <circle cx="52" cy="32" r="5" fill={dotColor} opacity={dotOpacity[2]}/>
        <circle cx="20" cy="50" r="4" fill={dotColor} opacity={dotOpacity[3]}/>
        <circle cx="44" cy="50" r="4" fill={dotColor} opacity={dotOpacity[4]}/>
        <circle cx="32" cy="32" r="10" fill={centerColor}/>
      </svg>
    );
  };

  const bg = darkMode ? colors.gray900 : '#FFFFFF';
  const cardBg = darkMode ? '#1E293B' : colors.offWhite;
  const textPrimary = darkMode ? '#F8FAFC' : colors.gray900;
  const textSecondary = darkMode ? colors.gray500 : colors.slate;

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: darkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)', borderBottom: `1px solid ${darkMode ? '#1E293B' : colors.gray100}` }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} variant={darkMode ? 'dark' : 'default'} />
            <span className="text-xl font-bold tracking-wider" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>
              MUSTER
            </span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: darkMode ? colors.amber : colors.navy }}
          >
            <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* Hero */}
        <section className="text-center py-12">
          <LogoMark size={120} variant={darkMode ? 'dark' : 'default'} />
          <h1 className="text-5xl font-bold tracking-wider mt-8 mb-4" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>
            MUSTER
          </h1>
          <p className="text-xl" style={{ color: colors.amber }}>Operations Assembled</p>
        </section>

        {/* Logo System */}
        <section>
          <h2 className="text-2xl font-bold mb-8" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>
            Logo System
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Primary */}
            <div className="p-8 rounded-2xl" style={{ backgroundColor: cardBg }}>
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: textSecondary }}>Primary</p>
              <div className="flex items-center gap-4 mb-4">
                <LogoMark size={56} />
                <span className="text-3xl font-bold tracking-wider" style={{ color: colors.navy, fontFamily: "'Outfit', sans-serif" }}>
                  MUSTER
                </span>
              </div>
              <p className="text-sm" style={{ color: textSecondary }}>Full color on light backgrounds</p>
            </div>

            {/* Dark */}
            <div className="p-8 rounded-2xl" style={{ backgroundColor: colors.navy }}>
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: colors.slateLight }}>Dark</p>
              <div className="flex items-center gap-4 mb-4">
                <LogoMark size={56} variant="dark" />
                <span className="text-3xl font-bold tracking-wider text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  MUSTER
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.slateLight }}>For dark backgrounds</p>
            </div>

            {/* Mono Navy */}
            <div className="p-8 rounded-2xl" style={{ backgroundColor: cardBg }}>
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: textSecondary }}>Monochrome</p>
              <div className="flex items-center gap-4 mb-4">
                <LogoMark size={56} variant="mono" />
                <span className="text-3xl font-bold tracking-wider" style={{ color: colors.navy, fontFamily: "'Outfit', sans-serif" }}>
                  MUSTER
                </span>
              </div>
              <p className="text-sm" style={{ color: textSecondary }}>Single color applications</p>
            </div>

            {/* Mono White */}
            <div className="p-8 rounded-2xl" style={{ backgroundColor: colors.gray900 }}>
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: colors.gray500 }}>Monochrome White</p>
              <div className="flex items-center gap-4 mb-4">
                <LogoMark size={56} variant="mono-white" />
                <span className="text-3xl font-bold tracking-wider text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  MUSTER
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.gray500 }}>Single color on dark</p>
            </div>
          </div>

          {/* Size Scale */}
          <div className="mt-8 p-8 rounded-2xl" style={{ backgroundColor: cardBg }}>
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: textSecondary }}>Scale</p>
            <div className="flex items-end justify-center gap-8">
              {[80, 56, 40, 32, 24, 16].map(size => (
                <div key={size} className="text-center">
                  <LogoMark size={size} variant={darkMode ? 'dark' : 'default'} />
                  <p className="text-xs mt-3" style={{ color: textSecondary }}>{size}px</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-8" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>
            Color Palette
          </h2>
          {copiedColor && (
            <p className="text-sm mb-4" style={{ color: colors.success }}>✓ Copied {copiedColor}</p>
          )}
          
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'Navy', hex: colors.navy, light: false },
              { name: 'Navy Light', hex: colors.navyLight, light: false },
              { name: 'Amber', hex: colors.amber, light: true },
              { name: 'Amber Dark', hex: colors.amberDark, light: true },
              { name: 'Slate', hex: colors.slate, light: false },
              { name: 'Slate Light', hex: colors.slateLight, light: true },
              { name: 'Success', hex: colors.success, light: false },
              { name: 'Gray 500', hex: colors.gray500, light: false },
            ].map(color => (
              <div 
                key={color.name}
                onClick={() => copyColor(color.hex, color.name)}
                className="rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="h-20" style={{ backgroundColor: color.hex }} />
                <div className="p-3" style={{ backgroundColor: cardBg }}>
                  <p className="font-medium text-sm" style={{ color: textPrimary }}>{color.name}</p>
                  <p className="text-xs font-mono" style={{ color: textSecondary }}>{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold mb-8" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>
            Typography
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg }}>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: textSecondary }}>Display</p>
              <p className="text-4xl font-bold" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>
                Outfit Bold
              </p>
              <p className="text-sm mt-2" style={{ color: textSecondary }}>Headlines & wordmark</p>
            </div>
            <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg }}>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: textSecondary }}>Body</p>
              <p className="text-xl" style={{ color: textPrimary }}>
                Inter Regular
              </p>
              <p className="text-sm mt-2" style={{ color: textSecondary }}>Body text & UI</p>
            </div>
          </div>
        </section>

        {/* App Preview */}
        <section>
          <h2 className="text-2xl font-bold mb-8" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>
            In Use
          </h2>
          
          <div className="rounded-2xl overflow-hidden shadow-xl">
            {/* App header */}
            <div className="px-5 py-4 flex items-center gap-4" style={{ backgroundColor: colors.navy }}>
              <LogoMark size={32} variant="dark" />
              <span className="font-bold text-white tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
                MUSTER
              </span>
              <div className="ml-8 flex gap-6 text-sm text-white/60">
                <span className="text-white">Projects</span>
                <span>Crew</span>
                <span>Equipment</span>
                <span>Safety</span>
              </div>
              <div className="ml-auto w-8 h-8 rounded-full" style={{ backgroundColor: colors.amber }} />
            </div>
            {/* App content mock */}
            <div className="p-6 h-48" style={{ backgroundColor: colors.offWhite }}>
              <div className="flex gap-4">
                <div className="w-48 h-32 rounded-lg" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
                <div className="w-48 h-32 rounded-lg" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
                <div className="w-48 h-32 rounded-lg" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
              </div>
            </div>
          </div>

          {/* Browser tab */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-t-lg" style={{ backgroundColor: cardBg }}>
            <LogoMark size={16} variant={darkMode ? 'dark' : 'default'} />
            <span className="text-sm" style={{ color: textPrimary }}>Muster - Project Alpha</span>
            <span className="ml-4 text-xs" style={{ color: textSecondary }}>×</span>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t" style={{ borderColor: darkMode ? '#1E293B' : colors.gray100 }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={24} variant={darkMode ? 'dark' : 'default'} />
            <span className="font-bold tracking-wider" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>
              MUSTER
            </span>
          </div>
          <p className="text-sm" style={{ color: textSecondary }}>Brand Guidelines v1.0</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap');
      `}</style>
    </div>
  );
};

export default MusterBrand;
