import Head from 'next/head';

interface SEOProps {
  title: string;
}

export const SEO = ({ title }: SEOProps) => (
  <Head>
    <title>{Array.from(new Set([title, 'Myseum'])).join(' | ')}</title>
  </Head>
);
