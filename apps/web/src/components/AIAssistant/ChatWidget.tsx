import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  sendChatMessage,
  subscribeStockNotification,
  subscribePriceDropAlert,
  fetchProductFromDB,
  type ChatMessage,
  type CartAction,
  type ChatResponse,
} from '../../middleware/api/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: CartAction | null;
  actionUsed?: boolean;
  wishlistAction?: ChatResponse['wishlistAction'];
  wishlistUsed?: boolean;
  stockAlertAction?: ChatResponse['stockAlertAction'];
  stockAlertUsed?: boolean;
  removeAction?: ChatResponse['removeAction'];
  removeUsed?: boolean;
  priceDropAction?: ChatResponse['priceDropAction'];
  priceDropUsed?: boolean;
  quantityAction?: ChatResponse['quantityAction'];
  quantityUsed?: boolean;
  navigateTo?: string;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm Aria, your AI shopping assistant 👋 I can help you find products, compare prices, manage your wishlist, track orders, and add items to your cart. What are you looking for today?",
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: '#6366F1',
            animation: 'ariaBounce 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function renderMarkdown(text: string, onProductClick?: (id: number) => void): string {
  // Make [ID:N] tags into clickable links, then strip the tag
  let result = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    .replace(/`([^`]+)`/g, '<code style="background:#EEF2FF;padding:1px 5px;border-radius:4px;font-size:0.85em">$1</code>')
    .replace(/\n/g, '<br/>');

  if (onProductClick) {
    // Wrap product names preceding [ID:N] in a clickable span
    result = result.replace(
      /<strong>(.*?)<\/strong>([^<]*?)\[ID:(\d+)\]/g,
      (_, name, between, id) =>
        `<strong><span style="cursor:pointer;text-decoration:underline;text-decoration-style:dotted" data-product-id="${id}">${name}</span></strong>${between}`
    );
    // Remove any remaining bare [ID:N] tags
    result = result.replace(/\[ID:\d+\]/g, '');
  } else {
    result = result.replace(/\[ID:\d+\]/g, '');
  }
  return result;
}

function ChatBubble({
  msg,
  onAddToCart,
  onAddToWishlist,
  onStockAlert,
  onNavigate,
  onRemoveFromCart,
  onPriceDropAlert,
  onQuantityUpdate,
}: {
  msg: Message;
  onAddToCart: (action: CartAction) => void;
  onAddToWishlist: (action: NonNullable<ChatResponse['wishlistAction']>) => void;
  onStockAlert: (action: NonNullable<ChatResponse['stockAlertAction']>) => void;
  onNavigate: (path: string) => void;
  onRemoveFromCart: (action: NonNullable<ChatResponse['removeAction']>) => void;
  onPriceDropAlert: (action: NonNullable<ChatResponse['priceDropAction']>) => void;
  onQuantityUpdate: (action: NonNullable<ChatResponse['quantityAction']>) => void;
}) {
  const navigate = useNavigate();
  const isUser = msg.role === 'user';

  function handleBubbleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const productId = target.dataset.productId;
    if (productId) navigate(`/product/${productId}`);
  }
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-1"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
        >
          A
        </div>
      )}
      <div className="max-w-[78%]">
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={isUser
            ? { background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff', borderBottomRightRadius: 4 }
            : { background: '#F1F5F9', color: '#1E293B', borderBottomLeftRadius: 4 }
          }
          onClick={handleBubbleClick}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content, isUser ? undefined : () => {}) }}
        />

        {/* Cart action */}
        {msg.action && !msg.actionUsed && (
          <button
            onClick={() => onAddToCart(msg.action!)}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add "{msg.action.productName}" to Cart
          </button>
        )}
        {msg.action && msg.actionUsed && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#10B981' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Added to cart
          </div>
        )}

        {/* Wishlist action */}
        {msg.wishlistAction && !msg.wishlistUsed && (
          <button
            onClick={() => onAddToWishlist(msg.wishlistAction!)}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #EC4899, #F43F5E)', color: '#fff', boxShadow: '0 2px 8px rgba(236,72,153,0.35)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Save "{msg.wishlistAction.productName}" to Wishlist
          </button>
        )}
        {msg.wishlistAction && msg.wishlistUsed && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#EC4899' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved to wishlist
          </div>
        )}

        {/* Remove from cart action */}
        {msg.removeAction && !msg.removeUsed && (
          <button
            onClick={() => onRemoveFromCart(msg.removeAction!)}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 2px 8px rgba(239,68,68,0.35)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
            Remove "{msg.removeAction.productName}" from Cart
          </button>
        )}
        {msg.removeAction && msg.removeUsed && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#EF4444' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Removed from cart
          </div>
        )}

        {/* Price drop alert action */}
        {msg.priceDropAction && !msg.priceDropUsed && (
          <button
            onClick={() => onPriceDropAlert(msg.priceDropAction!)}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', boxShadow: '0 2px 8px rgba(16,185,129,0.35)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
            Alert me when price drops
          </button>
        )}
        {msg.priceDropAction && msg.priceDropUsed && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#10B981' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Price drop alert set!
          </div>
        )}

        {/* Quantity update action */}
        {msg.quantityAction && !msg.quantityUsed && (
          <button
            onClick={() => onQuantityUpdate(msg.quantityAction!)}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #0EA5E9, #0284C7)', color: '#fff', boxShadow: '0 2px 8px rgba(14,165,233,0.35)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Update "{msg.quantityAction.productName}" to ×{msg.quantityAction.quantity}
          </button>
        )}
        {msg.quantityAction && msg.quantityUsed && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#0EA5E9' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Quantity updated!
          </div>
        )}

        {/* Stock alert action */}
        {msg.stockAlertAction && !msg.stockAlertUsed && (
          <button
            onClick={() => onStockAlert(msg.stockAlertAction!)}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff', boxShadow: '0 2px 8px rgba(245,158,11,0.35)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Notify me when back in stock
          </button>
        )}
        {msg.stockAlertAction && msg.stockAlertUsed && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#F59E0B' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Stock alert set!
          </div>
        )}

        {/* Navigate action */}
        {msg.navigateTo && (
          <button
            onClick={() => onNavigate(msg.navigateTo!)}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', color: '#fff', boxShadow: '0 2px 8px rgba(14,165,233,0.35)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
            Go there now
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { cart, addToCart, removeFromCart } = useCart()!;
  const { wishlist, addToWishlist } = useWishlist()!;
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Personalise welcome message once user logs in
  useEffect(() => {
    if (user?.firstName) {
      setMessages([{
        ...WELCOME,
        content: `Welcome back, **${user.firstName}**! 👋 I'm Aria, your personal shopping assistant. I can help you find products, track orders, manage your wishlist, and more. What can I do for you today?`,
      }]);
    } else {
      setMessages([WELCOME]);
    }
  }, [user?.firstName]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleRemoveFromCart = useCallback(async (
    action: NonNullable<ChatResponse['removeAction']>,
    msgId: string
  ) => {
    try {
      await removeFromCart(action.productId);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, removeUsed: true } : m));
    } catch { /* silently fail */ }
  }, [removeFromCart]);

  const handlePriceDropAlert = useCallback(async (
    action: NonNullable<ChatResponse['priceDropAction']>,
    msgId: string
  ) => {
    try {
      await subscribePriceDropAlert(action.productId);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, priceDropUsed: true } : m));
    } catch {
      // Price drop endpoint may not exist yet — still mark as used optimistically
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, priceDropUsed: true } : m));
    }
  }, []);

  const handleQuantityUpdate = useCallback(async (
    action: NonNullable<ChatResponse['quantityAction']>,
    msgId: string
  ) => {
    try {
      const product = await fetchProductFromDB(String(action.productId));
      // Remove existing then add with new quantity
      await removeFromCart(action.productId);
      addToCart(product, action.quantity);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, quantityUsed: true } : m));
    } catch { /* silently fail */ }
  }, [addToCart, removeFromCart]);

  const handleAddToCart = useCallback(async (action: CartAction, msgId: string) => {
    try {
      const product = await fetchProductFromDB(String(action.productId));
      addToCart(product, action.quantity);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionUsed: true } : m));
    } catch { /* silently fail */ }
  }, [addToCart]);

  const handleAddToWishlist = useCallback(async (
    action: NonNullable<ChatResponse['wishlistAction']>,
    msgId: string
  ) => {
    try {
      const product = await fetchProductFromDB(String(action.productId));
      addToWishlist(product);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, wishlistUsed: true } : m));
    } catch { /* silently fail */ }
  }, [addToWishlist]);

  const handleStockAlert = useCallback(async (
    action: NonNullable<ChatResponse['stockAlertAction']>,
    msgId: string
  ) => {
    try {
      await subscribeStockNotification(action.productId);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, stockAlertUsed: true } : m));
    } catch { /* silently fail */ }
  }, []);

  const handleNavigate = useCallback((path: string, msgId: string) => {
    navigate(path);
    setOpen(false);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, navigateTo: undefined } : m));
  }, [navigate]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const cartContext = cart.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity }));
    const wishlistContext = wishlist.map(i => ({ id: i.id, title: i.title, price: i.price }));

    let currentProduct: { id: number; title: string; price: number; category?: string; description?: string } | undefined;
    const pdpMatch = location.pathname.match(/^\/product\/(\d+)/);
    if (pdpMatch) {
      try {
        const p = await fetchProductFromDB(pdpMatch[1]);
        currentProduct = { id: p.id, title: p.title, price: p.price, category: p.category, description: p.description };
      } catch { /* ignore */ }
    }

    const history: ChatMessage[] = messages
      .filter(m => m.id !== 'welcome')
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: text });

    try {
      const response = await sendChatMessage(history, {
        cart: cartContext,
        wishlist: wishlistContext,
        currentProduct,
        page: location.pathname,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        action: response.action,
        navigateTo: response.navigateTo,
        wishlistAction: response.wishlistAction,
        stockAlertAction: response.stockAlertAction,
        removeAction: response.removeAction,
        priceDropAction: response.priceDropAction,
        quantityAction: response.quantityAction,
      };
      // Execute bulk cart adds immediately (e.g. "add all wishlist to cart")
      if (response.bulkCartActions?.length) {
        for (const a of response.bulkCartActions) {
          try {
            const p = await fetchProductFromDB(String(a.productId));
            addToCart(p, a.quantity);
          } catch { /* silently skip */ }
        }
      }
      // Execute bulk cart removes immediately (e.g. "remove all except X")
      if (response.bulkRemoveActions?.length) {
        for (const a of response.bulkRemoveActions) {
          try { await removeFromCart(a.productId); } catch { /* silently skip */ }
        }
      }
      setMessages(prev => [...prev, assistantMsg]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, cart, location.pathname, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = user
    ? ['Show my orders', 'What\'s on sale?', 'Show my wishlist', 'Any promo codes?', 'I have $100, what can I buy?']
    : ['Find me a gift under $50', 'What\'s on sale?', 'Show me beauty products', 'Any promo codes?', 'I have $100, what can I buy?'];

  return (
    <>
      <style>{`
        @keyframes ariaBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes ariaSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ariaPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
        }
      `}</style>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: 360,
            height: 540,
            background: '#fff',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(99,102,241,0.12)',
            animation: 'ariaSlideUp 0.25s ease-out',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">A</div>
              <div>
                <div className="text-white font-semibold text-sm">Aria</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 0 2px rgba(52,211,153,0.3)' }} />
                  <span className="text-white/70 text-xs">
                    {user ? `Shopping for ${user.firstName ?? user.email}` : 'AI Shopping Assistant'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin' }}>
            {messages.map(msg => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                onAddToCart={(action) => handleAddToCart(action, msg.id)}
                onAddToWishlist={(action) => handleAddToWishlist(action, msg.id)}
                onStockAlert={(action) => handleStockAlert(action, msg.id)}
                onNavigate={(path) => handleNavigate(path, msg.id)}
                onRemoveFromCart={(action) => handleRemoveFromCart(action, msg.id)}
                onPriceDropAlert={(action) => handlePriceDropAlert(action, msg.id)}
                onQuantityUpdate={(action) => handleQuantityUpdate(action, msg.id)}
              />
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-1"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>A</div>
                <div className="rounded-2xl" style={{ background: '#F1F5F9', borderBottomLeftRadius: 4 }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
                  style={{ borderColor: '#E0E7FF', color: '#6366F1', background: '#EEF2FF' }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: '#F8FAFF', border: '1.5px solid #E0E7FF' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                style={{ color: '#1E293B' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#E2E8F0',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
        style={{
          background: open ? '#64748B' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          boxShadow: open ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 20px rgba(99,102,241,0.5)',
          animation: !open ? 'ariaPulse 2.5s ease-in-out infinite' : 'none',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        aria-label="Open AI shopping assistant"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="12" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
        {unread > 0 && !open && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: '#EF4444' }}
          >
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
