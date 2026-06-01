import { renderToString } from "react-dom/server";
import PDPStatic from "./pages/PDPStatic";
import type { Product } from "./middleware/api/client";

export function renderPDP(product: Product): string {
  return renderToString(<PDPStatic product={product} />);
}
