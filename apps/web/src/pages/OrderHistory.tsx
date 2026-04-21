import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  id: number;
  productId: number;
  title: string;
  price: string;
  quantity: number;
  thumbnail: string | null;
}

interface Order {
  id: number;
  totalAmount: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  placed:     { bg: 'rgba(99,102,241,0.12)',  color: '#6366F1', dot: '#6366F1', label: 'Order Placed' },
  processing: { bg: 'rgba(245,158,11,0.12)',  color: '#D97706', dot: '#F59E0B', label: 'Processing' },
  shipped:    { bg: 'rgba(6,182,212,0.12)',   color: '#0891B2', dot: '#06B6D4', label: 'Shipped' },
  delivered:  { bg: 'rgba(22,163,74,0.12)',   color: '#16A34A', dot: '#22C55E', label: 'Delivered' },
};

const PAYMENT_CONFIG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  card:      { label: 'Credit / Debit Card', bg: '#1A1F71', color: '#fff', icon: '💳' },
  paypal:    { label: 'PayPal',              bg: '#003087', color: '#FFC439', icon: '🅿' },
  googlepay: { label: 'Google Pay',          bg: '#202124', color: '#4285F4', icon: 'G' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return; }
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setOrders(data.orders ?? []); setLoading(false); })
      .catch(() => { setError('Could not load orders.'); setLoading(false); });
  }, [user, navigate]);

  const totalSpent = orders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
  const totalItems = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);

  const hasOrders = !loading && !error && orders.length > 0;

  return (
    <div className="min-h-screen" style={{ background: hasOrders ? '#F1F5F9' : '#0F172A' }}>

      {/* Hero header */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#0F172A 0%,#1E1B4B 60%,#0F172A 100%)', paddingBottom: hasOrders ? 56 : 0 }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 65%)', transform: 'translate(20%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(6,182,212,0.12) 0%,transparent 65%)', transform: 'translate(-20%,30%)' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10">
          <Link to="/account" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-6 px-3 py-1.5 rounded-full"
            style={{ color: '#94A3B8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            ← Back to Account
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6366F1' }}>Purchase History</p>
              <h1 className="text-5xl font-black tracking-tight text-white mb-1">My Orders</h1>
              <p className="text-sm" style={{ color: '#64748B' }}>
                {user?.firstName ? `Hey ${user.firstName}, here's` : "Here's"} everything you've ordered
              </p>
            </div>

            {/* Stats — only when orders exist */}
            {hasOrders && (
              <div className="flex gap-3">
                {[
                  { label: 'Orders', value: orders.length, icon: '📦' },
                  { label: 'Items',  value: totalItems,    icon: '🛍️' },
                  { label: 'Spent',  value: `$${totalSpent.toFixed(2)}`, icon: '💰' },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center px-4 py-3 rounded-2xl min-w-[80px]"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                    <span className="text-lg mb-0.5">{s.icon}</span>
                    <span className="text-lg font-black text-white">{s.value}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loading — inside hero */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#6366F1" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: '#64748B' }}>Loading your orders…</span>
            </div>
          )}

          {/* Error — inside hero */}
          {error && (
            <div className="mb-10 rounded-2xl px-5 py-4 text-sm font-medium max-w-lg"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}

          {/* Empty state — inside hero, no grey void */}
          {!loading && !error && orders.length === 0 && (
            <div className="flex flex-col items-center text-center pb-20 pt-4 gap-6">
              {/* Icon with layered glow rings */}
              <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
                <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(99,102,241,0.08)', animation: 'pulse-empty 3s ease-in-out infinite' }} />
                <div className="absolute rounded-full" style={{ inset: 16, background: 'rgba(99,102,241,0.1)' }} />
                <div className="relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
                  style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(59,130,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}>
                  📦
                </div>
              </div>

              <div>
                <p className="text-3xl font-black text-white mb-2">No orders yet</p>
                <p className="text-sm max-w-xs mx-auto" style={{ color: '#475569' }}>
                  Your purchase history will appear here once you place your first order.
                </p>
              </div>

              {/* Suggestion tiles */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {[
                  { label: 'Beauty', emoji: '💄' },
                  { label: 'Fragrances', emoji: '🌸' },
                  { label: 'Furniture', emoji: '🛋️' },
                  { label: 'Groceries', emoji: '🥦' },
                ].map(cat => (
                  <Link key={cat.label} to="/products"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#CBD5E1' }}>
                    <span>{cat.emoji}</span>{cat.label}
                  </Link>
                ))}
              </div>

              <Link to="/products">
                <button className="mt-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(90deg,#6366F1,#3B82F6)', boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }}>
                  Browse All Products →
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Wave — only when orders exist */}
        {hasOrders && (
          <div className="absolute bottom-0 left-0 right-0" style={{ height: 40 }}>
            <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d="M0,40 C480,0 960,0 1440,40 L1440,40 L0,40 Z" fill="#F1F5F9" />
            </svg>
          </div>
        )}
      </div>

      {/* Content — only when orders exist */}
      {hasOrders && (
      <div style={{ background: '#F1F5F9' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* placeholder — orders list below */}

          <div className="flex flex-col gap-4">
              {orders.map(order => {
                const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.placed;
                const payment = PAYMENT_CONFIG[order.paymentMethod] ?? PAYMENT_CONFIG.card;
                const isExpanded = expanded === order.id;
                const orderTotal = parseFloat(order.totalAmount);

                return (
                  <div key={order.id} className="rounded-3xl overflow-hidden transition-all duration-200"
                    style={{ background: '#fff', boxShadow: isExpanded ? '0 12px 40px rgba(15,23,42,0.12)' : '0 4px 20px rgba(15,23,42,0.06)', border: `1.5px solid ${isExpanded ? '#C7D7F5' : '#E2E8F0'}` }}>

                    {/* Top gradient bar */}
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#6366F1,#3B82F6,#06B6D4)' }} />

                    {/* Order header — clickable */}
                    <button className="w-full text-left px-6 pt-5 pb-4" onClick={() => setExpanded(isExpanded ? null : order.id)}>
                      <div className="flex items-start justify-between gap-4">

                        {/* Left: ID + meta */}
                        <div className="flex flex-col gap-2 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-lg font-black" style={{ color: '#0F172A' }}>Order #{order.id}</span>
                            {/* Status badge */}
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{ background: status.bg, color: status.color }}>
                              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: status.dot }} />
                              {status.label}
                            </span>
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-3 flex-wrap">
                            {/* Date */}
                            <div className="flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="3" width="12" height="11" rx="2" stroke="#94A3B8" strokeWidth="1.5"/>
                                <path d="M5 1v4M11 1v4M2 7h12" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                              <span className="text-xs font-medium" style={{ color: '#64748B' }}>{formatDate(order.createdAt)}</span>
                              <span className="text-xs" style={{ color: '#CBD5E1' }}>{formatTime(order.createdAt)}</span>
                            </div>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            {/* Payment method pill */}
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: payment.bg, color: payment.color }}>
                              <span>{payment.icon}</span>
                              <span>{payment.label}</span>
                            </span>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <span className="text-xs font-medium" style={{ color: '#64748B' }}>
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Right: amount + toggle */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-2xl font-black" style={{
                            background: 'linear-gradient(135deg,#6366F1,#3B82F6)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                          }}>
                            ${orderTotal.toFixed(2)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                            style={{ background: isExpanded ? '#EEF2FF' : '#F8FAFC', color: isExpanded ? '#6366F1' : '#94A3B8', border: `1px solid ${isExpanded ? '#C7D7F5' : '#E2E8F0'}` }}>
                            {isExpanded ? '▲ Hide' : '▼ Details'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Thumbnail strip */}
                    <div className="px-6 pb-5 flex items-center gap-2">
                      {order.items.slice(0, 5).map((item, idx) => (
                        <div key={item.id} className="relative shrink-0"
                          style={{ marginLeft: idx > 0 ? -10 : 0, zIndex: order.items.length - idx }}>
                          <img src={item.thumbnail ?? ''} alt={item.title}
                            className="w-11 h-11 rounded-xl object-cover"
                            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)', border: '2px solid #fff' }} />
                        </div>
                      ))}
                      {order.items.length > 5 && (
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                          style={{ background: '#EEF2FF', color: '#6366F1', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginLeft: -10 }}>
                          +{order.items.length - 5}
                        </div>
                      )}
                      <div className="flex-1" />
                      {/* Subtle reorder CTA */}
                      <Link to="/products" className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                        style={{ background: '#F8FAFC', color: '#6366F1', border: '1px solid #E0E7FF' }}>
                        Shop again →
                      </Link>
                    </div>

                    {/* Expanded items */}
                    {isExpanded && (
                      <div style={{ borderTop: '1.5px dashed #E2E8F0' }}>
                        <div className="px-6 pt-5 pb-2">
                          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94A3B8' }}>Items in this order</p>
                        </div>
                        <div className="px-6 flex flex-col gap-0">
                          {order.items.map((item, idx) => (
                            <div key={item.id}>
                              <div className="flex items-center gap-4 py-3.5">
                                <div className="relative shrink-0">
                                  <img src={item.thumbnail ?? ''} alt={item.title}
                                    className="w-16 h-16 rounded-2xl object-cover"
                                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.10)' }} />
                                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)', color: '#fff', boxShadow: '0 2px 6px rgba(99,102,241,0.4)' }}>
                                    {item.quantity}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{item.title}</p>
                                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                                    ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                                  </p>
                                </div>
                                <span className="text-base font-black shrink-0" style={{ color: '#1B3A6B' }}>
                                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              {idx < order.items.length - 1 && (
                                <div style={{ borderBottom: '1px dashed #F1F5F9' }} />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Order total footer */}
                        <div className="mx-6 mb-6 mt-3 rounded-2xl px-5 py-4 flex justify-between items-center"
                          style={{ background: 'linear-gradient(135deg,#0F172A,#1E3A5F)' }}>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748B' }}>Order Total</p>
                            <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>Incl. all discounts · Free shipping</p>
                          </div>
                          <span className="text-2xl font-black" style={{ color: '#34D399' }}>
                            ${orderTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
        </div>
      </div>
      )}

      <style>{`
        @keyframes pulse-empty {
          0%, 100% { transform: scale(1);   opacity: 0.6; }
          50%       { transform: scale(1.08); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
