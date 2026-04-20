import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import bannerOverlayImg from '../../assets/banner-sale.jpg';

const SALE_END = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function BannerOverlay() {
  const { h, m, s } = useCountdown(SALE_END);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: '700px' }}>
      {/* Image */}
      <img
        src={bannerOverlayImg}
        alt="Big Sale"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(120deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 55%, transparent 100%)' }}
      />

      {/* Floating discount badge — top right */}
      <div
        className="absolute top-5 right-5 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center shadow-xl z-10 rotate-12"
        style={{ background: '#DC2626', color: '#fff' }}
      >
        <span className="text-lg sm:text-2xl font-black leading-none">50%</span>
        <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wide">OFF</span>
      </div>

      {/* Text — vertically centred, left side */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 z-10 max-w-lg">

        {/* Live badge */}
        <span
          className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          style={{ background: '#DC2626', color: '#fff' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
          Sale is Live
        </span>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none mb-2 uppercase tracking-tight">
          Big<br />
          <span style={{ color: '#FCD34D' }}>Sale!</span>
        </h2>

        <p className="text-white/80 text-sm sm:text-base mb-4 max-w-xs">
          Up to <span className="font-bold text-white">50% off</span> on top styles — limited time only.
        </p>

        {/* Countdown */}
        <div className="flex items-center gap-2 mb-6">
          {[{ label: 'HRS', val: h }, { label: 'MIN', val: m }, { label: 'SEC', val: s }].map(({ label, val }, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-col items-center px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}>
                <span className="text-xl sm:text-2xl font-black text-white tabular-nums leading-none">
                  {String(val).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#FCD34D' }}>{label}</span>
              </div>
              {i < 2 && <span className="text-white/60 font-bold text-lg">:</span>}
            </div>
          ))}
        </div>

        <Link
          to="/products"
          className="self-start flex items-center gap-2 px-7 py-3 rounded-full text-sm font-extrabold uppercase tracking-wide shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: '#FCD34D', color: '#111827' }}
        >
          Shop the Sale
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
