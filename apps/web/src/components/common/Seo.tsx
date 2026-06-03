import { Helmet } from "react-helmet-async";

type Props = {
  /** Page title — rendered as "<title> | my-alokai-store" */
  title: string;
  description?: string;
  /** Canonical/OG URL. Defaults to the current location. */
  url?: string;
  /** Social-share image (Open Graph / Twitter). */
  image?: string;
  /** og:type — "product" for PDPs, "website" elsewhere. */
  type?: "website" | "product";
};

const SITE_NAME = "my-alokai-store";

/**
 * Per-page document head management (title, meta description, canonical,
 * Open Graph & Twitter cards). Drop one <Seo /> into any page/route.
 */
export default function Seo({
  title,
  description,
  url,
  image,
  type = "website",
}: Props) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical =
    url ?? (typeof window !== "undefined" ? window.location.href : undefined);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
