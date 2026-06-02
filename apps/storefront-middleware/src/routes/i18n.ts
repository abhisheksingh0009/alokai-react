import { Request, Response, Router } from 'express';

export interface LocaleConfig {
  code: string;
  label: string;
  flag: string;
  currency: string;
  region: string;
}

export interface CurrencyRate {
  code: string;
  rate: number;
  lastUpdated: string;
}

export interface I18nConfig {
  locale: string;
  currency: string;
  region: string;
}

// Alokai Supported locales configuration
const LOCALES: LocaleConfig[] = [
  { 
    code: 'en-US', 
    label: 'English (US)', 
    flag: '🇺🇸', 
    currency: 'USD', 
    region: 'US' 
  },
  { 
    code: 'es-ES', 
    label: 'Español', 
    flag: '🇪🇸', 
    currency: 'EUR', 
    region: 'ES' 
  },
  { 
    code: 'fr-FR', 
    label: 'Français', 
    flag: '🇫🇷', 
    currency: 'EUR', 
    region: 'FR' 
  },
  { 
    code: 'de-DE', 
    label: 'Deutsch', 
    flag: '🇩🇪', 
    currency: 'EUR', 
    region: 'DE' 
  },
  { 
    code: 'it-IT', 
    label: 'Italiano', 
    flag: '🇮🇹', 
    currency: 'EUR', 
    region: 'IT' 
  },
  { 
    code: 'pt-BR', 
    label: 'Português', 
    flag: '🇧🇷', 
    currency: 'BRL', 
    region: 'BR' 
  },
];

// Exchange rates (in production, fetch from real API)
const EXCHANGE_RATES: Record<string, CurrencyRate> = {
  USD: { code: 'USD', rate: 1.0, lastUpdated: new Date().toISOString() },
  EUR: { code: 'EUR', rate: 0.92, lastUpdated: new Date().toISOString() },
  GBP: { code: 'GBP', rate: 0.79, lastUpdated: new Date().toISOString() },
  BRL: { code: 'BRL', rate: 5.15, lastUpdated: new Date().toISOString() },
};

const DEFAULT_LOCALE = 'en-US';

const router = Router();

// Helper: Parse vsf-locale cookie from request
const getLocaleFromRequest = (req: Request): string => {
  const cookies = req.headers.cookie?.split(';').reduce((acc: Record<string, string>, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key.trim()] = decodeURIComponent(value);
    return acc;
  }, {}) || {};

  return cookies['vsf-locale'] || req.query.locale?.toString() || DEFAULT_LOCALE;
};

// GET /api/i18n/locales - Get all supported locales
router.get('/locales', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: LOCALES
  });
});

// GET /api/i18n/config - Get current locale config from vsf-locale cookie
router.get('/config', (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  const localeConfig = LOCALES.find(l => l.code === locale);

  if (!localeConfig) {
    return res.status(400).json({
      success: false,
      error: `Unsupported locale: ${locale}`
    });
  }

  res.json({
    success: true,
    data: localeConfig
  });
});

// GET /api/i18n/currencies - Get all supported currencies with rates
router.get('/currencies', (req: Request, res: Response) => {
  const { base = 'USD' } = req.query;
  
  const baseRate = EXCHANGE_RATES[base as string]?.rate;
  if (!baseRate) {
    return res.status(400).json({
      success: false,
      error: `Unsupported base currency: ${base}`
    });
  }

  const currencies = Object.values(EXCHANGE_RATES).map(currency => ({
    ...currency,
    rate: parseFloat((currency.rate / baseRate).toFixed(4))
  }));

  res.json({
    success: true,
    data: {
      base: base as string,
      currencies
    }
  });
});

// POST /api/i18n/convert - Convert price between currencies
router.post('/convert', (req: Request, res: Response) => {
  const { amount, from, to } = req.body;

  if (amount === undefined || !from || !to) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: amount, from, to'
    });
  }

  const fromRate = EXCHANGE_RATES[from]?.rate;
  const toRate = EXCHANGE_RATES[to]?.rate;

  if (!fromRate || !toRate) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported currency'
    });
  }

  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;

  res.json({
    success: true,
    data: {
      originalAmount: amount,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      fromCurrency: from,
      toCurrency: to,
      rate: parseFloat((toRate / fromRate).toFixed(4)),
      timestamp: new Date().toISOString()
    }
  });
});

// GET /api/i18n/translations/:locale - Get translations for specific locale
router.get('/translations/:locale', async (req: Request, res: Response) => {
  const { locale } = req.params;
  
  try {
    const translations = await loadTranslations(locale);
    
    if (!translations) {
      return res.status(404).json({
        success: false,
        error: `Translations not found for locale: ${locale}`
      });
    }

    res.json({
      success: true,
      data: {
        locale,
        translations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load translations'
    });
  }
});

// POST /api/i18n/format-price - Format price for specific locale
router.post('/format-price', (req: Request, res: Response) => {
  const { amount, locale, currency } = req.body;

  if (amount === undefined || !locale || !currency) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: amount, locale, currency'
    });
  }

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    res.json({
      success: true,
      data: {
        amount,
        formatted,
        locale,
        currency
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid locale or currency format'
    });
  }
});

// POST /api/i18n/set-locale - Set vsf-locale cookie
router.post('/set-locale', (req: Request, res: Response) => {
  const { locale } = req.body;

  if (!locale) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: locale'
    });
  }

  const localeConfig = LOCALES.find(l => l.code === locale);
  if (!localeConfig) {
    return res.status(400).json({
      success: false,
      error: `Unsupported locale: ${locale}`
    });
  }

  // Set vsf-locale cookie
  res.setHeader('Set-Cookie', `vsf-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`);

  res.json({
    success: true,
    data: {
      message: 'Locale set successfully',
      locale,
      localeConfig
    }
  });
});

// Helper function to load translations
async function loadTranslations(locale: string) {
  const translations: Record<string, any> = {
    'en-US': {
      common: { home: 'Home', about: 'About', contact: 'Contact', logout: 'Logout' },
      header: {
        search_placeholder: 'Search products...',
        cart: 'Cart',
        account: 'Account',
        menu: 'Menu',
        language: 'Language',
        currency: 'Currency'
      },
      product: {
        add_to_cart: 'Add to Cart',
        in_stock: 'In Stock',
        out_of_stock: 'Out of Stock',
        price: 'Price',
        description: 'Description'
      },
      cart: {
        empty_cart: 'Your cart is empty',
        checkout: 'Checkout',
        subtotal: 'Subtotal',
        total: 'Total'
      }
    },
    'es-ES': {
      common: { home: 'Inicio', about: 'Acerca de', contact: 'Contacto', logout: 'Cerrar sesión' },
      header: {
        search_placeholder: 'Buscar productos...',
        cart: 'Carrito',
        account: 'Cuenta',
        menu: 'Menú',
        language: 'Idioma',
        currency: 'Moneda'
      },
      product: {
        add_to_cart: 'Añadir al carrito',
        in_stock: 'En stock',
        out_of_stock: 'Sin stock',
        price: 'Precio',
        description: 'Descripción'
      },
      cart: {
        empty_cart: 'Tu carrito está vacío',
        checkout: 'Pagar',
        subtotal: 'Subtotal',
        total: 'Total'
      }
    },
    'fr-FR': {
      common: { home: 'Accueil', about: 'À propos', contact: 'Contact', logout: 'Déconnexion' },
      header: {
        search_placeholder: 'Rechercher des produits...',
        cart: 'Panier',
        account: 'Compte',
        menu: 'Menu',
        language: 'Langue',
        currency: 'Devise'
      },
      product: {
        add_to_cart: 'Ajouter au panier',
        in_stock: 'En stock',
        out_of_stock: 'Rupture de stock',
        price: 'Prix',
        description: 'Description'
      },
      cart: {
        empty_cart: 'Votre panier est vide',
        checkout: 'Passer la commande',
        subtotal: 'Sous-total',
        total: 'Total'
      }
    },
    'de-DE': {
      common: { home: 'Startseite', about: 'Über uns', contact: 'Kontakt', logout: 'Abmelden' },
      header: {
        search_placeholder: 'Produkte suchen...',
        cart: 'Warenkorb',
        account: 'Konto',
        menu: 'Menü',
        language: 'Sprache',
        currency: 'Währung'
      },
      product: {
        add_to_cart: 'In den Warenkorb',
        in_stock: 'Auf Lager',
        out_of_stock: 'Ausverkauft',
        price: 'Preis',
        description: 'Beschreibung'
      },
      cart: {
        empty_cart: 'Ihr Warenkorb ist leer',
        checkout: 'Zur Kasse',
        subtotal: 'Summe',
        total: 'Gesamtsumme'
      }
    },
    'it-IT': {
      common: { home: 'Home', about: 'Chi siamo', contact: 'Contatti', logout: 'Esci' },
      header: {
        search_placeholder: 'Cerca prodotti...',
        cart: 'Carrello',
        account: 'Account',
        menu: 'Menu',
        language: 'Lingua',
        currency: 'Valuta'
      },
      product: {
        add_to_cart: 'Aggiungi al carrello',
        in_stock: 'In magazzino',
        out_of_stock: 'Esaurito',
        price: 'Prezzo',
        description: 'Descrizione'
      },
      cart: {
        empty_cart: 'Il tuo carrello è vuoto',
        checkout: 'Procedi all\'acquisto',
        subtotal: 'Subtotale',
        total: 'Totale'
      }
    },
    'pt-BR': {
      common: { home: 'Início', about: 'Sobre', contact: 'Contato', logout: 'Sair' },
      header: {
        search_placeholder: 'Pesquisar produtos...',
        cart: 'Carrinho',
        account: 'Conta',
        menu: 'Menu',
        language: 'Idioma',
        currency: 'Moeda'
      },
      product: {
        add_to_cart: 'Adicionar ao carrinho',
        in_stock: 'Em estoque',
        out_of_stock: 'Fora de estoque',
        price: 'Preço',
        description: 'Descrição'
      },
      cart: {
        empty_cart: 'Seu carrinho está vazio',
        checkout: 'Ir para o checkout',
        subtotal: 'Subtotal',
        total: 'Total'
      }
    }
  };

  return translations[locale] || null;
}

export { router as i18nRouter };
