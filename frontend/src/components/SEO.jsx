import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Mwiti Bakers';
const DEFAULT_TITLE = 'Mwiti Bakers - Home of Sweetness | Premium Baking Content';
const DEFAULT_DESC =
  'Unlock professional baking recipe books and expert training videos. Mwiti Bakers brings you premium digital bakery content from Kenya.';
const DEFAULT_IMAGE = '/New.jpg';

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  noindex = false,
}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mwitibakers.com';
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDesc = description || DEFAULT_DESC;
  const pageImage = image ? (image.startsWith('http') ? image : `${origin}${image}`) : `${origin}${DEFAULT_IMAGE}`;
  const pageUrl = url || origin;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDesc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />

      {/* Canonical */}
      <link rel="canonical" href={pageUrl} />
    </Helmet>
  );
}
