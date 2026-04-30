import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken } from '../integrations/auth/index.js';

const router = Router();

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  cart?: { id: number; title: string; price: number; quantity: number }[];
  currentProduct?: { id: number; title: string; price: number; category?: string; description?: string };
  page?: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  category: string | null;
  stock: number | null;
  discountPercentage: number | null;
  description: string | null;
  brand: string | null;
}

interface OrderItem { title: string; productId: number; price: number; quantity: number; }
interface OrderSummary { id: number; totalAmount: number; createdAt: string; items: OrderItem[]; }
interface WishlistItem { id: number; title: string; price: number; }

interface UserContext {
  userId: number;
  email: string;
  firstName?: string | null;
  orders?: OrderSummary[];
  wishlist?: WishlistItem[];
}

interface ChatResponse {
  message: string;
  action?: { productId: number; quantity: number; productName: string } | null;
  navigateTo?: string;
  wishlistAction?: { productId: number; productName: string };
  stockAlertAction?: { productId: number; productName: string };
  removeAction?: { productId: number; productName: string };
  priceDropAction?: { productId: number; productName: string };
  quantityAction?: { productId: number; quantity: number; productName: string };
  bulkCartActions?: { productId: number; quantity: number; productName: string }[];
  bulkRemoveActions?: { productId: number; productName: string }[];
}

// ── Demo Promo Codes ─────────────────────────────────────────────────────────

const PROMO_CODES = [
  { code: 'ARIA10', description: '10% off your entire order' },
  { code: 'BEAUTY20', description: '20% off all beauty products' },
  { code: 'NEWUSER15', description: '15% off for new members' },
  { code: 'SAVE5', description: '$5 off orders over $50' },
  { code: 'FREESHIP', description: 'Free express shipping on your next order' },
];

// ── Navigation Map ────────────────────────────────────────────────────────────

const NAV_MAP: Array<{ keywords: string[]; path: string; label: string }> = [
  { keywords: ['beauty', 'makeup', 'cosmetic', 'skincare', 'lipstick', 'foundation'], path: '/products?category=beauty', label: 'Beauty' },
  { keywords: ['fragrance', 'perfume', 'cologne', 'scent'], path: '/products?category=fragrances', label: 'Fragrances' },
  { keywords: ['furniture', 'sofa', 'chair', 'table', 'bed', 'desk', 'home'], path: '/products?category=furniture', label: 'Furniture' },
  { keywords: ['grocery', 'groceries', 'food', 'snack', 'organic'], path: '/products?category=groceries', label: 'Groceries' },
  { keywords: ['cart', 'shopping cart', 'my cart'], path: '/cart', label: 'Cart' },
  { keywords: ['wishlist', 'wish list', 'saved items', 'my wishlist'], path: '/wishlist', label: 'Wishlist' },
  { keywords: ['order', 'orders', 'order history', 'my orders', 'past orders'], path: '/orders', label: 'Order History' },
  { keywords: ['checkout', 'pay', 'payment', 'place order'], path: '/checkout', label: 'Checkout' },
  { keywords: ['login', 'sign in', 'log in'], path: '/login', label: 'Login' },
  { keywords: ['signup', 'sign up', 'register', 'create account'], path: '/signup', label: 'Sign Up' },
  { keywords: ['account', 'profile', 'my account'], path: '/account', label: 'Account' },
  { keywords: ['home', 'homepage', 'main page'], path: '/', label: 'Home' },
  { keywords: ['products', 'all products', 'shop', 'browse'], path: '/products', label: 'All Products' },
];

// ── Intent Detection ─────────────────────────────────────────────────────────

function detectMaxPrice(text: string): number | null {
  const m =
    text.match(/under\s+\$?(\d+)/i) ||
    text.match(/less\s+than\s+\$?(\d+)/i) ||
    text.match(/below\s+\$?(\d+)/i) ||
    text.match(/max\s+\$?(\d+)/i) ||
    text.match(/\$?(\d+)\s+budget/i) ||
    text.match(/budget.*?\$?(\d+)/i);
  return m ? parseInt(m[1]) : null;
}

function detectMinPrice(text: string): number | null {
  const m =
    text.match(/over\s+\$?(\d+)/i) ||
    text.match(/more\s+than\s+\$?(\d+)/i) ||
    text.match(/above\s+\$?(\d+)/i) ||
    text.match(/atleast\s+\$?(\d+)/i);
  return m ? parseInt(m[1]) : null;
}

function extractKeywords(text: string): string[] {
  const stopwords = new Set(['a','an','the','is','are','was','were','be','been','being','have','has','had',
    'do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought',
    'i','me','my','myself','we','our','ours','you','your','yours','he','him','his','she','her','hers',
    'it','its','they','them','their','what','which','who','whom','this','that','these','those','and',
    'but','or','nor','for','yet','so','in','on','at','to','from','with','by','of','about','as','into',
    'through','during','before','after','above','below','between','out','off','over','under','again',
    'then','once','here','there','when','where','why','how','all','both','each','few','more','most',
    'other','some','such','no','not','only','same','than','too','very','just','any','find','show',
    'get','want','looking','need','something','give','tell','help','good','best','nice','great',
    'cheap','expensive','recommend','suggest','something','anything','please','can','make','let',
    'like','love','buy','purchase','add','cart','want','looking','searching','have','know','think',
    'item','items','product','products','something','things',
    'yes','yeah','yep','yup','no','nope','ok','okay','sure','add','please','go','ahead']);

  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w));
}

const CATEGORY_MAP: Record<string, string[]> = {
  beauty:      ['beauty','makeup','cosmetic','skincare','lipstick','foundation','serum','moisturizer','cream','lotion','nail','mascara','eyeshadow','powder','blush'],
  fragrances:  ['fragrance','perfume','cologne','scent','eau de','parfum','spray','deodorant'],
  furniture:   ['furniture','sofa','chair','table','bed','desk','shelf','cabinet','lamp','decor','home','room','living','bedroom','couch','wardrobe'],
  groceries:   ['food','grocery','groceries','snack','drink','beverage','fruit','vegetable','organic','kitchen','cooking','meal','juice','coffee','tea','bread','rice','pasta'],
};

function detectCategory(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return null;
}

function isUnsupportedCategory(text: string): boolean {
  const unsupported = ['electronic','phone','laptop','computer','tablet','camera','tv','television',
    'headphone','speaker','gadget','tech','device','wireless','cloth','shirt','dress','pant','jean',
    'jacket','coat','fashion','apparel','hoodie','sneaker','boot','shoe','sport','fitness','gym',
    'workout','yoga','running','cycling','camping','hiking','toy','game','kids','children','lego',
    'puzzle','car','auto','vehicle','motorcycle','bike','tire','motor'];
  const lower = text.toLowerCase();
  return unsupported.some(k => lower.includes(k));
}

function isGreeting(text: string): boolean {
  return /^(hi|hello|hey|howdy|greetings|good\s+(morning|afternoon|evening)|what's up|sup)\b/i.test(text.trim());
}

function isThankYou(text: string): boolean {
  return /\b(thank|thanks|thx|ty|cheers|perfect|great|awesome|wonderful|excellent)\b/i.test(text);
}

function isSaleQuery(text: string): boolean {
  return /(sale|discount|deal|offer|cheap|saving|promo|off\b|clearance)/i.test(text);
}

function isCartAddIntent(text: string): boolean {
  const trimmed = text.trim();
  if (/^(yes|yeah|yep|yup|sure|ok|okay|add|add it|add that|do it|get it|i'll take it|sounds good|perfect|go ahead|please|yes please|yes add|add this one)$/i.test(trimmed)) return true;
  return /(add|buy|purchase|order|want|i'll have|i want|put it)/i.test(text)
    && /(cart|it|that|this|one|please)/i.test(text);
}

function isWishlistAddIntent(text: string): boolean {
  // Exclude "add wishlist to cart" patterns
  if (/(add|move|put).*(wishlist|saved).*(to|into).*(cart|basket)/i.test(text)) return false;
  if (/(wishlist|saved).*(to|into).*(cart|basket)/i.test(text)) return false;
  return /(add|save|put|move).*(wishlist|wish list|saved|favorites|favourite)/i.test(text) ||
    /(wishlist|wish list|save for later|bookmark).*(add|this|it)/i.test(text);
}

function isWishlistToCartIntent(text: string): boolean {
  return /(add|move|put).*(wishlist|saved).*(to|into).*(cart|basket)/i.test(text) ||
    /(wishlist|saved).*(to|into|add to).*(cart|basket)/i.test(text) ||
    /(all|everything).*(wishlist|saved).*(cart)/i.test(text);
}

function isWishlistShowIntent(text: string): boolean {
  return /(show|view|see|check|what('s| is| are)|list).*(wishlist|wish list|saved items|favorites|my saved)/i.test(text) ||
    /^(my wishlist|wishlist|saved items)$/i.test(text.trim());
}

function isOrderHistoryIntent(text: string): boolean {
  return /(my orders|order history|past orders|previous orders|what did i order|what have i ordered|show.*orders|recent orders)/i.test(text);
}

function isReorderIntent(text: string): boolean {
  return /(reorder|order again|buy again|repeat.*order|same.*again)/i.test(text);
}

function isCompareIntent(text: string): boolean {
  return /(compare|vs\.?|versus|difference between|which is better|which one)/i.test(text);
}

function isStockAlertIntent(text: string): boolean {
  return /(notify|alert|tell me|let me know|back in stock|when.*available|stock alert|out of stock.*notify)/i.test(text)
    && !/(price|sale|deal|discount|cheaper|drop)/i.test(text);
}

function isCartRemoveIntent(text: string): boolean {
  return /(remove|delete|take out|drop|clear).*(from|out of|off).*(cart|basket)/i.test(text) ||
    /(remove|delete).*(item|product|this|that|it)/i.test(text);
}

function isPriceDropAlertIntent(text: string): boolean {
  return /(notify|alert|tell me|let me know|ping me).*(price|sale|deal|discount|cheaper|drop)/i.test(text) ||
    /(price.*(drop|alert|watch|track)|when.*(cheaper|on sale|goes on sale|price drops))/i.test(text);
}

function isQuantityUpdateIntent(text: string): boolean {
  return /(change|update|set|make).*(quantity|qty|amount|number).*(to|=|:)\s*\d+/i.test(text) ||
    /(quantity|qty).*(change|update|set).*(to|=|:)\s*\d+/i.test(text) ||
    /(change|update|set).*\bto\b.*\d+/i.test(text);
}

function extractQuantity(text: string): number | null {
  const m = text.match(/\bto\s+(\d+)\b/i) || text.match(/\b(\d+)\s+(?:of|units?|pieces?|items?)\b/i);
  return m ? parseInt(m[1]) : null;
}

function isBudgetPlannerIntent(text: string): boolean {
  return /(i have|my budget is|spend|with)\s+\$?\d+.*(buy|get|spend|afford|suggest|recommend)/i.test(text) ||
    /(what can i (buy|get|afford)|suggest.*for \$?\d+|\$?\d+.*to spend)/i.test(text);
}

function isPromoIntent(text: string): boolean {
  return /(promo|coupon|discount code|voucher|code|offer code|any.*deal|any.*save)/i.test(text);
}

function isNavigateIntent(text: string): boolean {
  return /(take me to|go to|navigate|open|show me the|bring me to|visit|redirect|redirect me to)/i.test(text);
}

function isAuthStatusIntent(text: string): boolean {
  return /(am i logged in|am i signed in|are you logged in|check.*login|login status|my account status|is my account|who am i)/i.test(text);
}

function isSignupIntent(text: string): boolean {
  return /(create.*account|sign up|signup|register|new account|join|make.*account|open.*account)/i.test(text);
}

function isLoginIntent(text: string): boolean {
  return /(log in|login|sign in|signin)/i.test(text) && !isSignupIntent(text);
}

function isRecommendIntent(text: string): boolean {
  return /(recommend|suggest|what should i|what do you think|what.*try|based on|similar to|you might like)/i.test(text);
}

// ── Response Builder ─────────────────────────────────────────────────────────

function scoreProduct(product: Product, keywords: string[]): number {
  if (!keywords.length) return 0;
  const title = product.title.toLowerCase();
  const haystack = [title, product.category ?? '', product.description ?? '', product.brand ?? ''].join(' ');
  return keywords.reduce((score, kw) => {
    const re = new RegExp(`\\b${kw}\\b`, 'i');
    if (re.test(haystack)) return score + (re.test(title) ? 3 : 1);
    return score;
  }, 0);
}

function formatPrice(p: Product): string {
  if (p.discountPercentage && p.discountPercentage > 0) {
    const orig = p.price.toFixed(2);
    const disc = (p.price * (1 - p.discountPercentage / 100)).toFixed(2);
    return `~~$${orig}~~ **$${disc}** (${Math.round(p.discountPercentage)}% off)`;
  }
  return `$${p.price.toFixed(2)}`;
}

function detectPreferences(history: ChatMessage[]): string[] {
  const prefs: string[] = [];
  const prefPatterns = [
    { re: /prefer organic|organic only|only organic/i, label: 'organic' },
    { re: /cruelty[- ]free/i, label: 'cruelty-free' },
    { re: /under \$(\d+)|budget.*\$(\d+)/i, label: 'budget-conscious' },
    { re: /premium|luxury|high[- ]end/i, label: 'premium' },
    { re: /fragrance[- ]free|no fragrance/i, label: 'fragrance-free' },
  ];
  for (const m of history) {
    for (const { re, label } of prefPatterns) {
      if (re.test(m.content) && !prefs.includes(label)) prefs.push(label);
    }
  }
  return prefs;
}

async function buildResponse(
  userText: string,
  history: ChatMessage[],
  context: ChatContext,
  allProducts: Product[],
  userCtx?: UserContext
): Promise<ChatResponse> {

  const lower = userText.toLowerCase();
  const firstName = userCtx?.firstName ?? null;
  const isLoggedIn = !!userCtx;

  // ── Greeting ────────────────────────────────────────────────────────────────
  if (isGreeting(userText) && history.filter(m => m.role === 'user').length <= 1) {
    if (isLoggedIn && firstName) {
      return {
        message: `Welcome back, **${firstName}**! 👋 I'm Aria, your personal shopping assistant. ${
          userCtx?.orders?.length
            ? `I can see you've placed ${userCtx.orders.length} order${userCtx.orders.length > 1 ? 's' : ''} with us before — want me to suggest something based on your history?`
            : "How can I help you today?"
        }`,
      };
    }
    return {
      message: "Hi there! I'm Aria, your personal shopping assistant 🛍️ I can help you discover products, compare prices, find deals, and add items straight to your cart. What are you looking for today?",
    };
  }

  // ── Auth status ─────────────────────────────────────────────────────────────
  if (isAuthStatusIntent(userText)) {
    if (isLoggedIn && userCtx) {
      return {
        message: `Yes, you're logged in as **${userCtx.email}**${firstName ? ` (${firstName})` : ''}. Is there anything I can help you with?`,
      };
    }
    return {
      message: "You're not currently logged in. Want me to take you to the login page?",
      navigateTo: '/login',
    };
  }

  // ── Signup ───────────────────────────────────────────────────────────────────
  if (isSignupIntent(userText)) {
    if (isLoggedIn) {
      return { message: `You already have an account, ${firstName ?? 'there'}! Is there anything else I can help you with?` };
    }
    return { message: "Let's get you set up! I'll take you to the sign up page now. 🎉", navigateTo: '/signup' };
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  if (isLoginIntent(userText)) {
    if (isLoggedIn) {
      return { message: `You're already logged in as **${userCtx!.email}**! Anything I can help you with?` };
    }
    return { message: "Sure! Taking you to the login page now. 🔐", navigateTo: '/login' };
  }

  // ── Thank you ───────────────────────────────────────────────────────────────
  const hasSearchIntent = /\b(show|find|search|suggest|recommend|looking|want|need|buy|get|browse|beauty|fragrance|furniture|groceries|product|item|deal|sale|discount|price|under|budget|gift|perfume|lipstick|mascara|cream|sofa|chair|food|snack)\b/i.test(userText);
  if (isThankYou(userText) && userText.split(' ').length < 8 && !hasSearchIntent) {
    return {
      message: firstName
        ? `You're welcome, ${firstName}! Let me know if there's anything else I can help you with. Happy shopping! 😊`
        : "You're welcome! Let me know if there's anything else I can help you find. Happy shopping! 😊",
    };
  }

  // ── Promo codes ─────────────────────────────────────────────────────────────
  if (isPromoIntent(userText)) {
    const lines = PROMO_CODES.map(p => `• **\`${p.code}\`** — ${p.description}`).join('\n');
    return {
      message: `🎉 Here are your exclusive promo codes:\n\n${lines}\n\nEnter any of these at checkout to save! Want me to take you there? 🛒`,
    };
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  if (isNavigateIntent(userText)) {
    const textLower = userText.toLowerCase();
    for (const nav of NAV_MAP) {
      if (nav.keywords.some(k => textLower.includes(k))) {
        return {
          message: `Sure! Taking you to **${nav.label}** now... 🚀`,
          navigateTo: nav.path,
        };
      }
    }
  }

  // ── Order History ────────────────────────────────────────────────────────────
  if (isOrderHistoryIntent(userText)) {
    if (!isLoggedIn) {
      return { message: "You'll need to be logged in to see your order history. Want me to take you to the login page?", navigateTo: '/login' };
    }
    const orders = userCtx?.orders ?? [];
    if (!orders.length) {
      return { message: `You haven't placed any orders yet, ${firstName ?? 'there'}! Browse our products and let me help you find something you'll love. 🛍️` };
    }
    const recent = orders.slice(0, 3);
    const lines = recent.map(o => {
      const date = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const itemList = o.items.map(i => i.title).join(', ');
      return `• **Order #${o.id}** (${date}) — $${Number(o.totalAmount).toFixed(2)}\n  ${itemList}`;
    }).join('\n\n');
    return {
      message: `Here are your recent orders, ${firstName ?? ''}:\n\n${lines}\n\nWant to reorder any of these, or shall I suggest something new based on your taste?`,
    };
  }

  // ── Reorder ─────────────────────────────────────────────────────────────────
  if (isReorderIntent(userText)) {
    if (!isLoggedIn || !userCtx?.orders?.length) {
      return { message: "I don't have any past orders for you yet. Let me help you find something great to order! What are you looking for?" };
    }
    const lastOrder = userCtx.orders[0];
    const lastItem = lastOrder?.items?.[0];
    if (!lastItem) {
      return { message: "I couldn't find items in your last order. Want me to show your order history?" };
    }
    const product = allProducts.find(p => p.id === lastItem.productId);
    if (product && (product.stock ?? 0) > 0) {
      return {
        message: `Your last order included **${lastItem.title}**. Want me to add it to your cart again? 🛒`,
        action: { productId: lastItem.productId, quantity: lastItem.quantity, productName: lastItem.title },
      };
    }
    if (product && (product.stock ?? 0) <= 0) {
      const alt = allProducts.find(p =>
        (p.stock ?? 0) > 0 &&
        p.category === product.category &&
        p.id !== product.id
      );
      return {
        message: `Unfortunately **${lastItem.title}** is currently out of stock. ${
          alt ? `But you might like **${alt.title}** at ${formatPrice(alt)} as a great alternative! [ID:${alt.id}]` : 'Let me know what else you\'re looking for.'
        }`,
        action: alt ? null : undefined,
      };
    }
    return { message: `Want to reorder **${lastItem.title}**? Just confirm and I'll add it to your cart!`, action: { productId: lastItem.productId, quantity: lastItem.quantity, productName: lastItem.title } };
  }

  // ── Wishlist → Cart ────────────────────────────────────────────────────────────
  if (isWishlistToCartIntent(userText)) {
    if (!isLoggedIn) {
      return { message: "You'll need to be logged in to do that. Want me to take you to the login page?", navigateTo: '/login' };
    }
    const items = userCtx?.wishlist ?? [];
    if (!items.length) {
      return { message: `Your wishlist is empty, ${firstName ?? 'there'}! Want me to help you find some products to save? 💝` };
    }
    // Add each wishlist item one by one via sequential actions — return the first and note the rest
    const first = items[0];
    const rest = items.slice(1);
    const restNames = rest.map(i => `**${i.title}**`).join(', ');
    return {
      message: `Adding all ${items.length} wishlist item${items.length > 1 ? 's' : ''} to your cart! Starting with **${first.title}**${
        rest.length ? ` — also adding ${restNames}` : ''
      }. 🛒`,
      action: { productId: first.id, quantity: 1, productName: first.title },
      ...(rest.length ? { bulkCartActions: rest.map(i => ({ productId: i.id, quantity: 1, productName: i.title })) } : {}),
    } as ChatResponse;
  }

  // ── Wishlist Show ────────────────────────────────────────────────────────────
  if (isWishlistShowIntent(userText)) {
    if (!isLoggedIn) {
      return { message: "Please log in to see your saved items! Want me to take you to the login page?", navigateTo: '/login' };
    }
    const items = userCtx?.wishlist ?? [];
    if (!items.length) {
      return { message: `Your wishlist is empty right now, ${firstName ?? ''}! Find products you love and save them for later. Want me to suggest some popular items? 💝` };
    }
    const lines = items.map(i => `• **${i.title}** — $${Number(i.price).toFixed(2)}`).join('\n');
    return {
      message: `Here's your wishlist, ${firstName ?? ''}:\n\n${lines}\n\nWant to add any of these to your cart, or shall I navigate you to your wishlist page?`,
      navigateTo: undefined,
    };
  }

  // ── Wishlist Add ─────────────────────────────────────────────────────────────
  if (isWishlistAddIntent(userText)) {
    if (!isLoggedIn) {
      return { message: "You'll need to be logged in to save items to your wishlist. Want to log in?", navigateTo: '/login' };
    }
    // Try to match product from current context or last mentioned
    if (context.currentProduct) {
      const p = context.currentProduct;
      return {
        message: `I'll save **${p.title}** to your wishlist! 💝`,
        wishlistAction: { productId: p.id, productName: p.title },
      };
    }
    const lastAssistant = [...history].reverse().find(m => m.role === 'assistant');
    if (lastAssistant) {
      const idMatch = lastAssistant.content.match(/\[ID:(\d+)\]/);
      if (idMatch) {
        const product = allProducts.find(p => p.id === parseInt(idMatch[1]));
        if (product) {
          return {
            message: `Saving **${product.title}** to your wishlist! 💝`,
            wishlistAction: { productId: product.id, productName: product.title },
          };
        }
      }
    }
    // Search by name mentioned in the message
    const wlKeywords = extractKeywords(userText);
    const nameMatch = wlKeywords.length
      ? allProducts
          .map(p => ({ p, score: scoreProduct(p, wlKeywords) }))
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)[0]?.p
      : null;
    if (nameMatch) {
      return {
        message: `Saving **${nameMatch.title}** to your wishlist! 💝`,
        wishlistAction: { productId: nameMatch.id, productName: nameMatch.title },
      };
    }
    return { message: "Which product would you like to save to your wishlist? Tell me what you're looking for and I'll find it for you!" };
  }

  // ── Smart Recommendations (based on order history) ──────────────────────────
  if (isRecommendIntent(userText) && isLoggedIn && userCtx?.orders?.length) {
    const orderedCategories = userCtx.orders
      .flatMap(o => o.items)
      .map(i => {
        const product = allProducts.find(p => p.id === i.productId);
        return product?.category ?? null;
      })
      .filter(Boolean) as string[];

    const topCategory = orderedCategories.reduce((acc: Record<string, number>, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    const favCat = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0]?.[0];

    if (favCat) {
      const orderedProductIds = new Set(userCtx.orders.flatMap(o => o.items.map(i => i.productId)));
      const recommendations = allProducts
        .filter(p => p.category === favCat && !orderedProductIds.has(p.id) && (p.stock ?? 0) > 0)
        .sort((a, b) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0))
        .slice(0, 3);

      if (recommendations.length) {
        const lines = recommendations.map(p => `• **${p.title}** — ${formatPrice(p)}`).join('\n');
        return {
          message: `Based on your order history, I think you'll love these **${favCat}** products you haven't tried yet:\n\n${lines}\n\nWant more details on any of these?`,
        };
      }
    }
  }

  // ── Product Comparison ───────────────────────────────────────────────────────
  if (isCompareIntent(userText)) {
    const keywords = extractKeywords(userText);
    if (keywords.length >= 2) {
      const scored = allProducts.map(p => ({ p, score: scoreProduct(p, keywords) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      if (scored.length >= 2) {
        const [a, b] = scored.map(x => x.p);
        const aDisc = a.discountPercentage ? (a.price * (1 - a.discountPercentage / 100)) : a.price;
        const bDisc = b.discountPercentage ? (b.price * (1 - b.discountPercentage / 100)) : b.price;
        const cheaper = aDisc <= bDisc ? a : b;
        const betterStock = (a.stock ?? 0) >= (b.stock ?? 0) ? a : b;

        return {
          message: `Here's a comparison:\n\n` +
            `**${a.title}**\n` +
            `• Price: ${formatPrice(a)}\n` +
            `• Stock: ${a.stock ?? 0} units\n` +
            `• Brand: ${a.brand ?? 'N/A'}\n\n` +
            `**${b.title}**\n` +
            `• Price: ${formatPrice(b)}\n` +
            `• Stock: ${b.stock ?? 0} units\n` +
            `• Brand: ${b.brand ?? 'N/A'}\n\n` +
            `💡 **${cheaper.title}** is better value${cheaper.discountPercentage ? ' with a ' + Math.round(cheaper.discountPercentage) + '% discount' : ''}. ` +
            `**${betterStock.title}** has better availability. Which would you like to add to your cart?`,
        };
      }
    }
  }

  // ── Stock Alert ──────────────────────────────────────────────────────────────
  if (isStockAlertIntent(userText)) {
    if (!isLoggedIn) {
      return { message: "You'll need to be logged in to set up stock alerts. Want me to take you to the login page?", navigateTo: '/login' };
    }
    const ctxProductId = context.currentProduct?.id;
    const targetProduct: Product | null = ctxProductId
      ? (allProducts.find(p => p.id === ctxProductId) ?? null)
      : (() => {
          const lastAssistant = [...history].reverse().find(m => m.role === 'assistant');
          if (!lastAssistant) return null;
          const m = lastAssistant.content.match(/\[ID:(\d+)\]/);
          return m ? allProducts.find(p => p.id === parseInt(m[1])) ?? null : null;
        })();

    if (targetProduct) {
      if ((targetProduct.stock ?? 0) > 0) {
        return { message: `Good news — **${targetProduct.title}** is already in stock! Want me to add it to your cart instead? 🛒` };
      }
      return {
        message: `I'll set up a stock alert for **${targetProduct.title}**. We'll notify you as soon as it's back in stock! 🔔`,
        stockAlertAction: { productId: targetProduct.id, productName: targetProduct.title },
      };
    }
    return { message: "Which product would you like to be notified about when it's back in stock? Tell me the product name or navigate to its page." };
  }

  // ── Cart Remove ────────────────────────────────────────────────────────────
  if (isCartRemoveIntent(userText)) {
    if (!context.cart?.length) {
      return { message: "Your cart is already empty! Want me to help you find something? 🛒" };
    }

    // ── "remove all except X" logic
    const exceptMatch = userText.match(/except\s+(.+)/i);
    if (exceptMatch || /(all|everything).*(except|but|apart from|other than)/i.test(userText)) {
      const exceptText = exceptMatch?.[1] ?? userText.replace(/(all|everything|remove|delete|clear).*(except|but|apart from|other than)\s*/i, '');
      const exceptKeywords = extractKeywords(exceptText);
      const keepItem = context.cart
        .map(i => ({ i, score: scoreProduct({ id: i.id, title: i.title, price: i.price, category: '', stock: 1, discountPercentage: null, description: null, brand: null }, exceptKeywords) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)[0]?.i;

      if (keepItem) {
        const toRemove = context.cart.filter(i => i.id !== keepItem.id);
        if (!toRemove.length) {
          return { message: `**${keepItem.title}** is the only item in your cart — nothing else to remove!` };
        }
        const names = toRemove.map(i => `**${i.title}**`).join(', ');
        return {
          message: `I'll remove ${names} from your cart, keeping **${keepItem.title}**. Confirm?`,
          bulkRemoveActions: toRemove.map(i => ({ productId: i.id, productName: i.title })),
        } as ChatResponse;
      }
    }

    // ── "remove all" logic
    if (/(remove|clear|delete|empty).*(all|everything|cart)/i.test(userText) && !exceptMatch) {
      const toRemove = context.cart;
      return {
        message: `I'll clear all ${toRemove.length} item${toRemove.length > 1 ? 's' : ''} from your cart. Confirm?`,
        bulkRemoveActions: toRemove.map(i => ({ productId: i.id, productName: i.title })),
      } as ChatResponse;
    }

    // ── Single item remove
    const keywords = extractKeywords(userText);
    const match = context.cart
      .map(i => ({ i, score: scoreProduct({ id: i.id, title: i.title, price: i.price, category: '', stock: 1, discountPercentage: null, description: null, brand: null }, keywords) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.i;

    if (match) {
      return {
        message: `I'll remove **${match.title}** from your cart. Confirm?`,
        removeAction: { productId: match.id, productName: match.title },
      };
    }
    const lines = context.cart.map(i => `• **${i.title}**`).join('\n');
    return { message: `Which item would you like to remove? Here's what's in your cart:\n\n${lines}` };
  }

  // ── Price Drop Alert ─────────────────────────────────────────────────────
  if (isPriceDropAlertIntent(userText)) {
    if (!isLoggedIn) {
      return { message: "You'll need to be logged in to set up price drop alerts. Want me to take you to the login page?", navigateTo: '/login' };
    }
    const targetProduct: Product | null = context.currentProduct
      ? (allProducts.find(p => p.id === context.currentProduct!.id) ?? null)
      : (() => {
          const last = [...history].reverse().find(m => m.role === 'assistant');
          if (!last) return null;
          const m = last.content.match(/\[ID:(\d+)\]/);
          return m ? allProducts.find(p => p.id === parseInt(m[1])) ?? null : null;
        })();

    if (targetProduct) {
      return {
        message: `I'll set up a price drop alert for **${targetProduct.title}** (currently ${formatPrice(targetProduct)}). You'll be notified when the price drops! 🔔`,
        priceDropAction: { productId: targetProduct.id, productName: targetProduct.title },
      };
    }
    return { message: "Which product would you like to track for a price drop? Tell me the product name or browse to its page." };
  }

  // ── Quantity Update ──────────────────────────────────────────────────────
  if (isQuantityUpdateIntent(userText)) {
    const newQty = extractQuantity(userText);
    if (!newQty || newQty < 1) {
      return { message: "What quantity would you like to set? Just tell me the product and the new amount." };
    }
    if (!context.cart?.length) {
      return { message: "Your cart is empty! Want me to help you find something to add? 🛒" };
    }
    const keywords = extractKeywords(userText);
    const match = context.cart
      .map(i => ({ i, score: scoreProduct({ id: i.id, title: i.title, price: i.price, category: '', stock: 1, discountPercentage: null, description: null, brand: null }, keywords) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.i
      ?? (context.cart.length === 1 ? context.cart[0] : null);

    if (match) {
      return {
        message: `I'll update **${match.title}** to quantity **${newQty}**. Confirm?`,
        quantityAction: { productId: match.id, quantity: newQty, productName: match.title },
      };
    }
    const lines = context.cart.map(i => `• **${i.title}**`).join('\n');
    return { message: `Which item's quantity would you like to update to ${newQty}?\n\n${lines}` };
  }

  // ── Budget Planner ───────────────────────────────────────────────────────
  if (isBudgetPlannerIntent(userText)) {
    const budget = detectMaxPrice(userText) ?? (() => {
      const m = userText.match(/\$?(\d+)/); return m ? parseInt(m[1]) : null;
    })();
    if (!budget) {
      return { message: "What's your budget? Tell me an amount and I'll suggest a great combination of products that fit! 💰" };
    }
    const detectedCat = detectCategory(userText);
    let pool = allProducts.filter(p => (p.stock ?? 0) > 0 && p.price <= budget);
    if (detectedCat) pool = pool.filter(p => (p.category ?? '').toLowerCase().includes(detectedCat));

    // Greedy knapsack: pick highest-discount items that fit within budget
    const sorted = [...pool].sort((a, b) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0));
    const basket: Product[] = [];
    let remaining = budget;
    for (const p of sorted) {
      const effectivePrice = p.discountPercentage ? p.price * (1 - p.discountPercentage / 100) : p.price;
      if (effectivePrice <= remaining) {
        basket.push(p);
        remaining -= effectivePrice;
        if (basket.length >= 4) break;
      }
    }

    if (!basket.length) {
      return { message: `I couldn't find any products${detectedCat ? ` in ${detectedCat}` : ''} under $${budget}. Want me to search a different category or raise the budget?` };
    }

    const total = basket.reduce((s, p) => s + (p.discountPercentage ? p.price * (1 - p.discountPercentage / 100) : p.price), 0);
    const lines = basket.map(p => `• **${p.title}** — ${formatPrice(p)} [ID:${p.id}]`).join('\n');
    return {
      message: `Here's what you can get with your $${budget} budget:\n\n${lines}\n\n**Total: ~$${total.toFixed(2)}** (saving $${(budget - total).toFixed(2)}) 🎉 Want me to add any of these to your cart?`,
    };
  }

  // ── Contextual "yes" — check what the last assistant message was asking ────
  const isSimpleYes = /^(yes|yeah|yep|yup|sure|ok|okay|please|go ahead|do it)$/i.test(userText.trim());
  if (isSimpleYes) {
    const lastAssistant = [...history].reverse().find(m => m.role === 'assistant');
    if (lastAssistant) {
      const msg = lastAssistant.content.toLowerCase();
      if (msg.includes('login page') || msg.includes('log in') || msg.includes('sign in')) {
        return { message: 'Taking you to the login page now! 🔐', navigateTo: '/login' };
      }
      if (msg.includes('sign up') || msg.includes('signup') || msg.includes('register')) {
        return { message: "Taking you to the sign up page! 🎉", navigateTo: '/signup' };
      }
      if (msg.includes('order history') || msg.includes('your orders')) {
        return { message: 'Taking you to your orders! 📦', navigateTo: '/orders' };
      }
      if (msg.includes('wishlist page')) {
        return { message: 'Taking you to your wishlist! 💝', navigateTo: '/wishlist' };
      }
      if (msg.includes('checkout')) {
        return { message: 'Taking you to checkout! 🛒', navigateTo: '/checkout' };
      }
    }
  }

  // ── Cart Add – current product ───────────────────────────────────────────────
  if (isCartAddIntent(userText) && context.currentProduct) {
    const p = context.currentProduct;
    const dbProduct = allProducts.find(ap => ap.id === p.id);
    if (dbProduct && (dbProduct.stock ?? 0) <= 0) {
      return {
        message: `Sorry, **${p.title}** is currently out of stock. Want me to set up a stock alert so you're notified when it's back? 🔔`,
        stockAlertAction: { productId: p.id, productName: p.title },
      };
    }
    return {
      message: `Great choice! I've added **${p.title}** to your cart. Anything else you'd like?`,
      action: { productId: p.id, quantity: 1, productName: p.title },
    };
  }

  // ── Cart Add – by name or last mentioned ────────────────────────────────────
  if (isCartAddIntent(userText)) {
    const userLower = userText.toLowerCase();
    const explicitMatch = allProducts
      .map(p => ({ p, score: scoreProduct(p, p.title.toLowerCase().split(' ').filter(w => w.length > 2)) }))
      .filter(({ p }) => {
        const titleWords = p.title.toLowerCase().split(' ').filter(w => w.length > 3);
        return titleWords.filter(w => userLower.includes(w)).length >= Math.min(2, titleWords.length);
      })
      .sort((a, b) => b.score - a.score)[0]?.p;

    if (explicitMatch) {
      if ((explicitMatch.stock ?? 0) <= 0) {
        return {
          message: `Sorry, **${explicitMatch.title}** is currently out of stock. Want me to set up a stock alert so you're notified when it's back? 🔔`,
          stockAlertAction: { productId: explicitMatch.id, productName: explicitMatch.title },
        };
      }
      return {
        message: `Done! **${explicitMatch.title}** has been added to your cart. Need anything else? 🛒`,
        action: { productId: explicitMatch.id, quantity: 1, productName: explicitMatch.title },
      };
    }

    const lastAssistant = [...history].reverse().find(m => m.role === 'assistant');
    if (lastAssistant) {
      const idMatch = lastAssistant.content.match(/\[ID:(\d+)\]/);
      if (idMatch) {
        const product = allProducts.find(p => p.id === parseInt(idMatch[1]));
        if (product) {
          if ((product.stock ?? 0) <= 0) {
            return {
              message: `Sorry, **${product.title}** is currently out of stock. Want me to set up a stock alert? 🔔`,
              stockAlertAction: { productId: product.id, productName: product.title },
            };
          }
          return {
            message: `Done! **${product.title}** has been added to your cart. Need anything else? 🛒`,
            action: { productId: product.id, quantity: 1, productName: product.title },
          };
        }
      }
    }
    return { message: "I'd be happy to add that to your cart! Could you tell me which product you mean, or would you like me to suggest something?" };
  }

  // ── Sale / deals ─────────────────────────────────────────────────────────────
  if (isSaleQuery(userText)) {
    const onSale = allProducts
      .filter(p => (p.discountPercentage ?? 0) > 10 && (p.stock ?? 0) > 0)
      .sort((a, b) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0))
      .slice(0, 3);

    if (!onSale.length) {
      return { message: "We don't have specific sale items right now, but I can help you find great value products! What category are you interested in?" };
    }

    const lines = onSale.map(p => `• **${p.title}** — ${formatPrice(p)}`).join('\n');
    const topDeal = onSale[0];
    return {
      message: `Here are our best deals right now:\n\n${lines}\n\nThe **${topDeal.title}** has the biggest discount at ${Math.round(topDeal.discountPercentage ?? 0)}% off! Want to add it to your cart? [ID:${topDeal.id}]`,
      action: null,
    };
  }

  // ── Cart summary ──────────────────────────────────────────────────────────────
  if (/(what('s| is) in (my )?cart|show (my )?cart|cart summary|cart list|my cart|view cart|see.*cart|list.*cart)/i.test(lower)) {
    if (!context.cart?.length) {
      return { message: "Your cart is empty right now! Tell me what you're looking for and I'll help you find the perfect items. 🛒" };
    }
    const total = context.cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const lines = context.cart.map(i => `• ${i.title} ×${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join('\n');
    return { message: `Here's what's in your cart:\n\n${lines}\n\n**Total: $${total.toFixed(2)}**\n\nReady to checkout, or want to keep browsing?` };
  }

  // ── Preference-aware product search ──────────────────────────────────────────
  const preferences = detectPreferences(history);
  const maxPrice = detectMaxPrice(userText);
  const minPrice = detectMinPrice(userText);
  const detectedCategory = detectCategory(userText);
  const keywords = extractKeywords(userText);

  let candidates = allProducts.filter(p => (p.stock ?? 0) > 0);

  if (maxPrice) candidates = candidates.filter(p => p.price <= maxPrice);
  if (minPrice) candidates = candidates.filter(p => p.price >= minPrice);
  if (preferences.includes('organic')) {
    const organic = candidates.filter(p => (p.title + ' ' + (p.description ?? '')).toLowerCase().includes('organic'));
    if (organic.length) candidates = organic;
  }

  if (detectedCategory) {
    const catFiltered = candidates.filter(p =>
      (p.category ?? '').toLowerCase().includes(detectedCategory) ||
      CATEGORY_MAP[detectedCategory]?.some(k => (p.title + ' ' + (p.description ?? '')).toLowerCase().includes(k))
    );
    if (catFiltered.length) candidates = catFiltered;
  }

  const hasFilter = maxPrice != null || minPrice != null || detectedCategory != null;
  const isGiftQuery = /gift|present|surprise|someone special/i.test(userText);

  const scored = candidates
    .map(p => ({ product: p, score: scoreProduct(p, keywords) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.product.discountPercentage ?? 0) - (a.product.discountPercentage ?? 0);
    });

  const top = scored
    .filter(x => x.score > 0 || hasFilter)
    .slice(0, 3)
    .map(x => x.product);

  if (!top.length) {
    // Out-of-stock alternative suggestion
    const outOfStockCandidates = allProducts.filter(p => (p.stock ?? 0) === 0);
    const oosMaybeMatch = outOfStockCandidates
      .map(p => ({ p, score: scoreProduct(p, keywords) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.p;

    if (oosMaybeMatch && isLoggedIn) {
      const alt = allProducts.find(a => a.category === oosMaybeMatch.category && (a.stock ?? 0) > 0);
      return {
        message: `**${oosMaybeMatch.title}** is currently out of stock. ${
          alt
            ? `But **${alt.title}** at ${formatPrice(alt)} is a great alternative and in stock! [ID:${alt.id}]`
            : 'Want me to set up a stock alert so you know when it\'s back?'
        }`,
        stockAlertAction: !alt ? { productId: oosMaybeMatch.id, productName: oosMaybeMatch.title } : undefined,
      };
    }

    if (isUnsupportedCategory(userText)) {
      return {
        message: "We currently carry beauty, fragrances, furniture, and groceries. I couldn't find what you're looking for in those categories — can I help you find something else?",
      };
    }
    const priceMsg = maxPrice ? ` under $${maxPrice}` : minPrice ? ` over $${minPrice}` : '';
    const catMsg = detectedCategory ? ` in ${detectedCategory}` : '';
    if (hasFilter) {
      return {
        message: `I couldn't find any in-stock products${catMsg}${priceMsg}. Want me to broaden the search, or can you tell me more about what you're looking for?`,
      };
    }
    return {
      message: "I'm not sure I understand — could you tell me a bit more about what you're looking for? For example, a category (beauty, fragrances, furniture, groceries), price range, or specific item? 😊",
    };
  }

  // Single strong match
  if (top.length === 1 || (scored[0]?.score >= 5 && scored[0]?.score > (scored[1]?.score ?? 0) * 1.8)) {
    const p = top[0];
    const stock = p.stock ?? 0;
    const stockNote = stock <= 5 ? ` ⚠️ Only ${stock} left!` : '';
    return {
      message: `I found a great match: **${p.title}** at ${formatPrice(p)}.${stockNote} ${p.description ? p.description.slice(0, 90) + '…' : ''} Want me to add it to your cart? [ID:${p.id}]`,
    };
  }

  // Multiple matches
  const lines = top.map(p => `• **${p.title}** — ${formatPrice(p)}`).join('\n');
  const priceNote = maxPrice ? ` under $${maxPrice}` : '';
  const giftIntro = isGiftQuery ? 'Here are some great gift ideas' : 'Here are some great options';
  const catNote = detectedCategory ? ` in ${detectedCategory}` : '';
  const prefNote = preferences.length ? ` (filtered for your ${preferences[0]} preference)` : '';

  return {
    message: `${giftIntro}${catNote}${priceNote}${prefNote}:\n\n${lines}\n\nWould you like more details on any of these, or shall I add one to your cart?`,
  };
}

// ── Route ────────────────────────────────────────────────────────────────────

router.post('/chat', async (req, res, next) => {
  try {
    const {
      messages,
      context = {},
      authToken,
    }: { messages: ChatMessage[]; context?: ChatContext; authToken?: string } = req.body;

    if (!messages?.length) {
      res.status(400).json({ error: 'messages is required' });
      return;
    }

    // ── Resolve user context from token ──────────────────────────────────────
    let userCtx: UserContext | undefined;

    if (authToken) {
      const decoded = verifyToken(authToken);
      if (decoded) {
        const [dbUser, orders, wishlistItems] = await Promise.all([
          prisma.user.findUnique({
            where: { email: decoded.email },
            select: { firstName: true },
          }),
          prisma.order.findMany({
            where: { userEmail: decoded.email },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { items: { select: { title: true, productId: true, price: true, quantity: true } } },
          }),
          prisma.wishlist.findMany({ where: { userEmail: decoded.email } }),
        ]);

        const wishlistProductIds = wishlistItems.map((w: { productId: number }) => w.productId);
        const wishlistProducts = wishlistProductIds.length
          ? await prisma.productDetails.findMany({
              where: { id: { in: wishlistProductIds } },
              select: { id: true, title: true, price: true },
            })
          : [];

        type OrderRow = typeof orders[number];
        type OrderItemRow = OrderRow['items'][number];

        userCtx = {
          userId: decoded.userId,
          email: decoded.email,
          firstName: dbUser?.firstName,
          orders: orders.map((o: OrderRow) => ({
            id: o.id,
            totalAmount: Number(o.totalAmount),
            createdAt: o.createdAt.toISOString(),
            items: o.items.map((i: OrderItemRow) => ({
              title: i.title,
              productId: i.productId,
              price: Number(i.price),
              quantity: i.quantity,
            })),
          })),
          wishlist: wishlistProducts.map((p: { id: number; title: string; price: unknown }) => ({
            id: p.id,
            title: p.title,
            price: Number(p.price ?? 0),
          })),
        };
      }
    }

    // ── Load all products ────────────────────────────────────────────────────
    const rawProducts = await prisma.productDetails.findMany({
      select: { id: true, title: true, price: true, category: true, stock: true, discountPercentage: true, description: true, brand: true },
    });

    const allProducts: Product[] = rawProducts.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price ? Number(p.price) : 0,
      category: p.category,
      stock: p.stock,
      discountPercentage: p.discountPercentage ? Number(p.discountPercentage) : null,
      description: p.description,
      brand: p.brand,
    }));

    const userText = messages[messages.length - 1].content;
    const history = messages.slice(0, -1);

    const result = await buildResponse(userText, history, context, allProducts, userCtx);

    await new Promise(r => setTimeout(r, 300 + Math.random() * 200));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
