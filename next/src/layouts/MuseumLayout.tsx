import Link from 'next/link';
import tw from 'twin.macro';
import Layout, { GetLayoutFunction, LayoutContext } from '@src/components/Layout';
import ViewToggle from '@src/components/ViewToggle';
import type { MuseumMapViewProps } from '@src/pages/museums/[museumId]';
import type { GalleryViewProps } from '@src/pages/museums/[museumId]/gallery/[galleryId]';
import Arrow from '@src/svgs/Arrow';

export const getMuseumLayout: GetLayoutFunction<MuseumMapViewProps> = (page, pageProps) => (
  <Layout
    navOverrides={{
      center: (
        <Link href={{ pathname: '/museums/[museumId]', query: { museumId: pageProps.museum.id } }}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            <span css={tw`flex mt-1.5 cursor-pointer`}>
              <h1 css={tw`font-serif leading-none text-3xl`}>{pageProps.museum.name}</h1>
            </span>
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

export const getMuseumHomeLayout: GetLayoutFunction<MuseumMapViewProps> = (page, pageProps) => (
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

export const getMuseumAboutLayout: GetLayoutFunction<MuseumMapViewProps> = (page, pageProps) => (
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

export const getMuseumGalleryLayout: GetLayoutFunction<GalleryViewProps> = (page, pageProps) => (
  <LayoutContext.Provider
    value={{
      navOverrides: {
        left: (
          <Link
            href={{ pathname: '/museums/[museumId]', query: { museumId: pageProps.museum.id } }}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>
              <span css={tw`flex items-center`}>
                <span css={tw`block size-3 mr-1.5`}>
                  <Arrow />
                </span>
                <span>Back to map</span>
              </span>
            </a>
          </Link>
        ),
        center: (
          <Link
            href={{ pathname: '/museums/[museumId]', query: { museumId: pageProps.museum.id } }}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>
              <span css={tw`flex cursor-pointer -mb-1`}>
                <h1 css={tw`font-serif leading-none text-lg`}>{pageProps.museum.name}</h1>
              </span>
            </a>
          </Link>
        ),
      },
    }}>
    {getMuseumLayout(page, pageProps)}
  </LayoutContext.Provider>
);
