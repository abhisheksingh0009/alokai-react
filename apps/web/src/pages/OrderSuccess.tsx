import { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SnapItem { id: number; title: string; price: number; quantity: number; thumbnail: string }

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
      w: 7 + Math.random() * 9, h: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      speed: 2.5 + Math.random() * 4.5,
      spin: (Math.random() - 0.5) * 0.18,
      drift: (Math.random() - 0.5) * 1.8,
      alpha: 0.85 + Math.random() * 0.15,
    }));
    let frame: number; let tick = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;
      const fadeOut = Math.max(0, 1 - tick / 240);
      for (const p of pieces) {
        p.y += p.speed; p.x += p.drift; p.rotation += p.spin;
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
      setDisplay(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = setTimeout(() => requestAnimationFrame(tick), 400);
    return () => clearTimeout(id);
  }, [value]);
  return <span>${display.toFixed(2)}</span>;
}

const PAYMENT_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  'Credit / Debit Card': { bg: 'rgba(99,102,241,0.15)',  color: '#818CF8', icon: '💳' },
  'PayPal':              { bg: 'rgba(0,48,135,0.3)',      color: '#FFC439', icon: '🅿' },
  'Google Pay':          { bg: 'rgba(255,255,255,0.08)',  color: '#4285F4', icon: 'G' },
};

export default function OrderSuccess() {
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as { total: number; orderId?: number; paymentMethod?: string; items?: SnapItem[] } | null;
  const total        = state?.total ?? 0;
  const orderId      = state?.orderId;
  const payMethod    = state?.paymentMethod ?? 'Card';
  const items        = state?.items ?? [];

  const now = new Date();
  const deliveryStart = new Date(now); deliveryStart.setDate(now.getDate() + 3);
  const deliveryEnd   = new Date(now); deliveryEnd.setDate(now.getDate() + 5);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const payStyle = PAYMENT_STYLE[payMethod] ?? PAYMENT_STYLE['Credit / Debit Card'];

  const steps = [
    { label: 'Order Placed',  sub: 'Just now',   done: true,  active: false },
    { label: 'Processing',    sub: 'In progress', done: false, active: true  },
    { label: 'Shipped',       sub: fmt(deliveryStart), done: false, active: false },
    { label: 'Delivered',     sub: fmt(deliveryEnd),   done: false, active: false },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F1F5F9' }}>
      <Confetti />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden flex flex-col items-center pt-14 pb-20 px-4 text-center"
        style={{ background: 'linear-gradient(145deg,#0F172A 0%,#1E3A5F 60%,#0F172A 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 20%, rgba(52,211,153,0.13) 0%, transparent 70%)' }} />

        {/* Check icon */}
        <div className="relative flex items-center justify-center mb-5"
          style={{ width: 110, height: 110, animation: 'pop-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', animation: 'pulse-ring 2s 0.8s ease-out infinite' }} />
          <div className="absolute rounded-full" style={{ inset: 8, background: 'rgba(52,211,153,0.18)', animation: 'pulse-ring 2s 1.1s ease-out infinite' }} />
          <div className="relative z-10 w-[88px] h-[88px] rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#059669,#34D399)', boxShadow: '0 0 50px rgba(52,211,153,0.45)' }}>
            <svg width="40" height="40" viewBox="0 0 44 44" fill="none" style={{ animation: 'draw-check 0.4s 0.5s both' }}>
              <path d="M9 23L18 32L35 14" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-white tracking-tight mb-1"
          style={{ animation: 'fade-up 0.5s 0.3s both', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
          Payment Successful!
        </h1>
        <p className="text-sm mb-7" style={{ color: '#64748B', animation: 'fade-up 0.5s 0.4s both' }}>
          Your order is confirmed and being prepared.
        </p>

        {/* Amount + Order ID row */}
        <div className="flex flex-col items-center gap-3 mb-8" style={{ animation: 'fade-up 0.5s 0.5s both' }}>
          <div className="flex flex-col items-center gap-1 px-10 py-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748B' }}>Total Paid</span>
            <span className="text-5xl font-black" style={{ color: '#34D399', letterSpacing: '-1px' }}>
              <AnimatedAmount value={total} />
            </span>
          </div>

          {/* Order ID pill — prominent */}
          {orderId && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="3" stroke="#818CF8" strokeWidth="1.5"/>
                <path d="M5 8h6M5 5.5h6M5 10.5h4" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>Order ID</span>
              <span className="text-sm font-black font-mono" style={{ color: '#C7D7F5' }}>#{orderId}</span>
            </div>
          )}
        </div>

        {/* ── Progress timeline — inside hero ── */}
        <div className="w-full max-w-md" style={{ animation: 'fade-up 0.5s 0.6s both' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-5" style={{ color: '#334155' }}>Order Progress</p>
          <div className="flex items-start justify-between relative">
            {/* Track */}
            <div className="absolute top-4 left-4 right-4 h-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="absolute top-4 left-4 h-0.5" style={{ width: '28%', background: 'linear-gradient(90deg,#059669,#34D399)' }} />

            {steps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={
                    step.done   ? { background: 'linear-gradient(135deg,#059669,#34D399)', color: '#fff', boxShadow: '0 0 12px rgba(52,211,153,0.5)' } :
                    step.active ? { background: 'rgba(255,255,255,0.08)', color: '#34D399', border: '2.5px solid #34D399', boxShadow: '0 0 0 4px rgba(52,211,153,0.15)' } :
                    { background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1.5px solid rgba(255,255,255,0.1)' }
                  }>
                  {step.done ? '✓' : i + 1}
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[11px] font-semibold text-center leading-tight"
                    style={{ color: step.done ? '#34D399' : step.active ? '#E2E8F0' : '#475569' }}>
                    {step.label}
                  </span>
                  <span className="text-[10px]" style={{ color: step.active ? '#64748B' : '#334155' }}>{step.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 48 }}>
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="#F1F5F9" />
          </svg>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-lg mx-auto px-4 -mt-2 pb-16 flex flex-col gap-5" style={{ animation: 'fade-up 0.6s 0.75s both' }}>

        {/* Order Details card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div className="h-1" style={{ background: 'linear-gradient(90deg,#6366F1,#3B82F6,#06B6D4)' }} />
          <div className="px-6 pt-5 pb-1">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94A3B8' }}>Order Details</p>
          </div>
          <div className="px-6 pb-5 flex flex-col divide-y divide-slate-50">

            {/* Order ID row */}
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: '#EEF2FF' }}>🧾</span>
                <span className="text-sm font-medium" style={{ color: '#64748B' }}>Order ID</span>
              </div>
              <span className="text-sm font-black font-mono" style={{ color: '#0F172A' }}>
                {orderId ? `#${orderId}` : '—'}
              </span>
            </div>

            {/* Payment method */}
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: '#EEF2FF' }}>{payStyle.icon}</span>
                <span className="text-sm font-medium" style={{ color: '#64748B' }}>Payment method</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: payStyle.bg, color: payStyle.color }}>
                {payMethod}
              </span>
            </div>

            {/* Estimated delivery */}
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: '#F0FDF4' }}>📦</span>
                <span className="text-sm font-medium" style={{ color: '#64748B' }}>Estimated delivery</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                {fmt(deliveryStart)} – {fmt(deliveryEnd)}
              </span>
            </div>

            {/* Confirmation email — real email */}
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: '#EFF6FF' }}>✉️</span>
                <span className="text-sm font-medium" style={{ color: '#64748B' }}>Confirmation sent to</span>
              </div>
              <span className="text-sm font-semibold truncate max-w-[180px]" style={{ color: '#6366F1' }}>
                {user?.email ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Items ordered */}
        {items.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <div className="h-1" style={{ background: 'linear-gradient(90deg,#6366F1,#3B82F6,#06B6D4)' }} />
            <div className="px-6 pt-5 pb-2 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94A3B8' }}>Items Ordered</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>
                {items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="px-6 pb-5 flex flex-col divide-y divide-slate-50">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="relative shrink-0">
                    <img src={item.thumbnail} alt={item.title}
                      className="w-14 h-14 rounded-2xl object-cover"
                      style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)', color: '#fff' }}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{item.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-black shrink-0" style={{ color: '#1B3A6B' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {/* Total row */}
              <div className="flex justify-between items-center pt-3 mt-1">
                <span className="text-sm font-bold" style={{ color: '#0F172A' }}>Total Paid</span>
                <span className="text-base font-black" style={{
                  background: 'linear-gradient(135deg,#6366F1,#3B82F6)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-3">
          <Link to="/orders" className="flex-1">
            <button className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#0F172A,#1E3A5F)', boxShadow: '0 4px 16px rgba(15,23,42,0.3)' }}>
              View Order History
            </button>
          </Link>
          <Link to="/products" className="flex-1">
            <button className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
              Continue Shopping
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
          100% { transform: scale(1.7); opacity: 0;   }
        }
        @keyframes draw-check {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1);   }
        }
      `}</style>
    </div>
  );
}
