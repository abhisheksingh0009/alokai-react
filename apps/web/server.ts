import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.SSR_PORT ?? 5174);
const MIDDLEWARE_URL = process.env.VITE_MIDDLEWARE_URL ?? "http://localhost:4000";
// Public base URL of the storefront — used to build absolute canonical URLs.
const SITE_URL = process.env.SITE_URL ?? `http://localhost:${PORT}`;

async function bootstrap() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);

  app.get(/^\/product\/(\d+)$/, async (req, res, next) => {
    try {
      const id = req.params[0];

      const apiRes = await fetch(`${MIDDLEWARE_URL}/api/products/${id}`);
      if (!apiRes.ok) return next();
      const dbProduct = (await apiRes.json()) as {
        id: number;
        title: string;
        description: string | null;
        category: string | null;
        price: string | null;
        discountPercentage: string | null;
        rating: string | null;
        stock: number | null;
        brand: string | null;
        warrantyInformation: string | null;
        shippingInformation: string | null;
        returnPolicy: string | null;
        thumbnail: string | null;
      };

      const product = {
        id: dbProduct.id,
        title: dbProduct.title,
        description: dbProduct.description ?? "",
        category: dbProduct.category ?? undefined,
        price: parseFloat(dbProduct.price ?? "0"),
        discountPercentage: dbProduct.discountPercentage ? parseFloat(dbProduct.discountPercentage) : undefined,
        rating: dbProduct.rating ? parseFloat(dbProduct.rating) : undefined,
        stock: dbProduct.stock ?? undefined,
        brand: dbProduct.brand ?? undefined,
        warrantyInformation: dbProduct.warrantyInformation ?? undefined,
        shippingInformation: dbProduct.shippingInformation ?? undefined,
        returnPolicy: dbProduct.returnPolicy ?? undefined,
        thumbnail: dbProduct.thumbnail ?? "",
        images: dbProduct.thumbnail ? [dbProduct.thumbnail] : [],
      };

      const template = await fs.readFile(path.resolve(__dirname, "index.html"), "utf-8");
      const transformed = await vite.transformIndexHtml(req.originalUrl, template);

      const { renderPDP } = await vite.ssrLoadModule("/src/entry-server.tsx");
      const appHtml = renderPDP(product);

      const canonicalUrl = `${SITE_URL}/product/${product.id}`;

      const metaTags = `
    <title>${escapeHtml(product.title)} | my-alokai-store</title>
    <meta name="description" content="${escapeHtml((product.description || "").slice(0, 160))}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${escapeHtml(product.title)}" />
    <meta property="og:description" content="${escapeHtml((product.description || "").slice(0, 160))}" />
    <meta property="og:image" content="${escapeHtml(product.thumbnail)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`;

      const html = transformed
        .replace("<title>my-alokai-store</title>", metaTags)
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      next(err);
    }
  });

  app.use(async (req, res, next) => {
    try {
      const template = await fs.readFile(path.resolve(__dirname, "index.html"), "utf-8");
      const transformed = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(transformed);
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      next(err);
    }
  });

  app.listen(PORT, () => {
    console.log(`SSR server listening on http://localhost:${PORT}`);
    console.log(`  PDP routes (SSR):    /product/:id`);
    console.log(`  All other routes:    SPA fallback via Vite`);
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

bootstrap();
