import { Fragment } from 'react';
import Link from 'next/link';
import tw from 'twin.macro';
import { Museum } from '@prisma/client';
import Layout, { LayoutContext, SubLayoutProps } from '@src/components/Layout';
import ViewToggle from '@src/components/ViewToggle';
import { useMuseum } from '@src/hooks/useMuseum';
import type { MuseumMapViewProps } from '@src/pages/museum/[museumId]';
import type { GalleryViewProps } from '@src/pages/museum/[museumId]/gallery/[galleryId]';
import Arrow from '@src/svgs/Arrow';

interface MuseumNameProps {
  museum: Museum;
}
const MuseumName = ({ museum: data }: MuseumNameProps) => {
  const museum = useMuseum(data);
  return <Fragment>{museum.name}</Fragment>;
};

export const MuseumLayout = ({ children, pageProps }: SubLayoutProps<MuseumMapViewProps>) => (
  <Layout
    navOverrides={{
      center: (
        <Link passHref href={{ pathname: pageProps.basePath }}>
          <a css={tw`flex mt-1.5 cursor-pointer`}>
            <h1 css={tw`font-serif leading-none text-center text-3xl`}>
              {/* TODO: fix useMuseum not updating when traversing back+forth b/w pages */}
              <MuseumName museum={pageProps.museum} />
            </h1>
          </a>
        </Link>
      ),
    }}>
    {children}
  </Layout>
);

export const MuseumHomeLayout = ({ children, pageProps }: SubLayoutProps<MuseumMapViewProps>) => (
  <LayoutContext.Provider
    value={{
      navOverrides: {
        left: (
          <Link
            passHref
            href={{
              pathname: `${pageProps.basePath}/about`,
            }}>
            <a>About</a>
          </Link>
        ),
        right: <ViewToggle basePath={pageProps.basePath} />,
      },
    }}>
    <MuseumLayout pageProps={pageProps}>{children}</MuseumLayout>
  </LayoutContext.Provider>
);

export const MuseumAboutLayout = ({ children, pageProps }: SubLayoutProps<MuseumMapViewProps>) => (
  <LayoutContext.Provider
    value={{
      navOverrides: {
        left: (
          <Link passHref href={{ pathname: pageProps.basePath }}>
            <a>Back</a>
          </Link>
        ),
      },
    }}>
    <MuseumLayout pageProps={pageProps}>{children}</MuseumLayout>
  </LayoutContext.Provider>
);

// TODO: update with museum name
export const MuseumGalleryLayout = ({ children, pageProps }: SubLayoutProps<GalleryViewProps>) => (
  <LayoutContext.Provider
    value={{
      navOverrides: {
        left: (
          <Link
            passHref
            href={{ pathname: '/museum/[museumId]', query: { museumId: pageProps.museum.id } }}>
            <a css={tw`flex items-center`}>
              <span css={tw`block size-3 mr-1.5`}>
                <Arrow />
              </span>
              <span>Back to map</span>
            </a>
          </Link>
        ),
        center: (
          <Link
            passHref
            href={{ pathname: '/museum/[museumId]', query: { museumId: pageProps.museum.id } }}>
            <a css={tw`flex cursor-pointer -mb-1`}>
              <h1 css={tw`font-serif leading-none text-center text-lg`}>{pageProps.museum.name}</h1>
            </a>
          </Link>
        ),
      },
    }}>
    {/* {getMuseumLayout(page, pageProps)} */}
    {children}
  </LayoutContext.Provider>
);
