import Link from 'next/link';
import tw from 'twin.macro';
import Layout, { GetLayoutFunction, LayoutContext } from '@src/components/Layout';
import type { MuseumProps } from '@src/pages/museums/[museumId]';
import ViewToggle from '@src/components/ViewToggle';
import { GalleryProps } from '@src/pages/museums/[museumId]/gallery/[galleryId]';

export const getMuseumLayout: GetLayoutFunction<MuseumProps> = (page, pageProps) => (
  <Layout
    navOverrides={{
      center: (
        <Link href={{ pathname: '/museums/[museumId]', query: { museumId: pageProps.museum.id } }}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            <h1 css={tw`flex mt-1.5 cursor-pointer font-serif leading-none text-3xl`}>
              {pageProps.museum.name}
            </h1>
          </a>
        </Link>
      ),
      right: (
        <div className="no-replace">
          <button>Log in</button>
        </div>
      ),
    }}>
    {page}
  </Layout>
);

export const getMuseumHomeLayout: GetLayoutFunction<MuseumProps> = (page, pageProps) => (
  <LayoutContext.Provider
    value={{
      navOverrides: {
        left: (
          <Link
            href={{
              pathname: '/museums/[museumId]/about',
              query: { museumId: pageProps.museum.id },
            }}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>About</a>
          </Link>
        ),
        right: <ViewToggle />,
      },
    }}>
    {getMuseumLayout(page, pageProps)}
  </LayoutContext.Provider>
);

export const getMuseumAboutLayout: GetLayoutFunction<MuseumProps> = (page, pageProps) => (
  <LayoutContext.Provider
    value={{
      navOverrides: {
        left: (
          <Link
            href={{ pathname: '/museums/[museumId]', query: { museumId: pageProps.museum.id } }}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>Back</a>
          </Link>
        ),
      },
    }}>
    {getMuseumLayout(page, pageProps)}
  </LayoutContext.Provider>
);

export const getMuseumGalleryLayout: GetLayoutFunction<GalleryProps> = (page, pageProps) => (
  <LayoutContext.Provider
    value={{
      navOverrides: {
        left: (
          <Link
            href={{ pathname: '/museums/[museumId]', query: { museumId: pageProps.museum.id } }}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>Back to map</a>
          </Link>
        ),
        center: (
          <Link
            href={{ pathname: '/museums/[museumId]', query: { museumId: pageProps.museum.id } }}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>
              <h1 css={tw`flex mt-1.5 cursor-pointer font-serif leading-none text-xl`}>
                {pageProps.museum.name}
              </h1>
            </a>
          </Link>
        ),
      },
    }}>
    {getMuseumLayout(page, pageProps)}
  </LayoutContext.Provider>
);
