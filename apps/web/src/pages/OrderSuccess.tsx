import { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#38BDF8', '#fff'];
    const pieces = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5,
      w: 7 + Math.random() * 9,
      h: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      speed: 2.5 + Math.random() * 4.5,
      spin: (Math.random() - 0.5) * 0.18,
      drift: (Math.random() - 0.5) * 1.8,
      alpha: 0.85 + Math.random() * 0.15,
    }));

    let frame: number;
    let tick = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;
      const fadeOut = Math.max(0, 1 - tick / 240);

      for (const p of pieces) {
        p.y += p.speed;
        p.x += p.drift;
        p.rotation += p.spin;
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha * fadeOut;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (tick < 260) frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }} />;
}

function AnimatedAmount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 900;
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(value * ease);
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = setTimeout(() => requestAnimationFrame(tick), 400);
    return () => clearTimeout(id);
  }, [value]);

  return <span>${display.toFixed(2)}</span>;
}

export default function OrderSuccess() {
  const location = useLocation();
  const total: number = (location.state as { total: number })?.total ?? 0;
  const orderId = `PP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  const now = new Date();
  const deliveryStart = new Date(now);
  deliveryStart.setDate(deliveryStart.getDate() + 3);
  const deliveryEnd = new Date(now);
  deliveryEnd.setDate(deliveryEnd.getDate() + 5);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const steps = [
    { label: 'Order placed', sub: 'Just now', done: true, active: false },
    { label: 'Processing', sub: 'In progress', done: false, active: true },
    { label: 'Shipped', sub: `~${fmt(deliveryStart)}`, done: false, active: false },
    { label: 'Delivered', sub: `By ${fmt(deliveryEnd)}`, done: false, active: false },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F1F5F9' }}>
      <Confetti />

      {/* Hero */}
      <div
        className="relative overflow-hidden flex flex-col items-center pt-16 pb-24 px-4 text-center"
        style={{ background: 'linear-gradient(145deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)' }}
      >
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(52,211,153,0.15) 0%, transparent 70%)',
        }} />

        {/* Checkmark with glow rings */}
        <div className="relative flex items-center justify-center mb-6" style={{ width: 120, height: 120, animation: 'pop-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(52,211,153,0.15)', animation: 'pulse-ring 2s 0.8s ease-out infinite' }} />
          <div className="absolute rounded-full" style={{ inset: 8, background: 'rgba(52,211,153,0.2)', animation: 'pulse-ring 2s 1.1s ease-out infinite' }} />
          <div className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #34D399)', boxShadow: '0 0 40px rgba(52,211,153,0.5)' }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ animation: 'draw-check 0.4s 0.5s both' }}>
              <path d="M9 23L18 32L35 14" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-white tracking-tight mb-2" style={{ animation: 'fade-up 0.5s 0.3s both', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
          Payment Successful!
        </h1>
        <p className="text-base mb-8" style={{ color: '#94A3B8', animation: 'fade-up 0.5s 0.45s both' }}>
          Thank you! Your order is confirmed and being prepared.
        </p>

        {/* Amount pill */}
        <div
          className="flex flex-col items-center gap-1 px-10 py-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', animation: 'fade-up 0.5s 0.55s both' }}
        >
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#64748B' }}>Total paid</span>
          <span className="text-5xl font-black" style={{ color: '#34D399', letterSpacing: '-1px' }}>
            <AnimatedAmount value={total} />
          </span>
        </div>

        {/* Order ID badge */}
        <div className="mt-4 flex items-center gap-2" style={{ animation: 'fade-up 0.5s 0.65s both' }}>
          <span className="text-xs" style={{ color: '#475569' }}>Order</span>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }}>
            {orderId}
          </span>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 48 }}>
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="#F1F5F9" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-lg mx-auto px-4 -mt-2 pb-16 flex flex-col gap-6" style={{ animation: 'fade-up 0.6s 0.7s both' }}>

        {/* Order details card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div className="px-6 pt-5 pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Order Details</p>
          </div>
          <div className="px-6 pb-5 flex flex-col">
            {[
              { icon: '💳', label: 'Payment method', value: 'PayPal', color: '#003087', bold: true },
              { icon: '📦', label: 'Estimated delivery', value: `${fmt(deliveryStart)} – ${fmt(deliveryEnd)}`, color: '#1E293B' },
              { icon: '✉️', label: 'Confirmation sent to', value: 'your email', color: '#6366F1' },
            ].map(({ icon, label, value, color, bold }) => (
              <div key={label} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm" style={{ color: '#64748B' }}>{label}</span>
                </div>
                <span className="text-sm" style={{ color, fontWeight: bold ? 700 : 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline card */}
        <div className="rounded-2xl px-6 py-5" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#94A3B8' }}>Order Progress</p>
          <div className="flex items-start justify-between relative">
            {/* Progress line */}
            <div className="absolute top-4 left-4 right-4 h-0.5" style={{ background: '#E2E8F0' }} />
            <div className="absolute top-4 left-4 h-0.5" style={{ width: '28%', background: 'linear-gradient(90deg, #059669, #34D399)' }} />

            {steps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                  style={
                    step.done ? { background: 'linear-gradient(135deg,#059669,#34D399)', color: '#fff' } :
                    step.active ? { background: '#fff', color: '#059669', border: '2.5px solid #34D399', boxShadow: '0 0 0 4px rgba(52,211,153,0.15)' } :
                    { background: '#F8FAFC', color: '#CBD5E1', border: '2px solid #E2E8F0' }
                  }
                >
                  {step.done ? '✓' : i + 1}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-center leading-tight" style={{ color: step.done || step.active ? '#1E293B' : '#94A3B8' }}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-center" style={{ color: '#CBD5E1' }}>{step.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Link to="/products" className="flex-1">
            <button className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1B3A6B, #2563EB)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
              Continue Shopping
            </button>
          </Link>
          <Link to="/" className="flex-1">
            <button className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-slate-100 active:scale-95"
              style={{ background: '#F1F5F9', color: '#475569' }}>
              Go Home
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes pop-in {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fade-up {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes draw-check {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
