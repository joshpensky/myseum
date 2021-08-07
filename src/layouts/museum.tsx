import Link from 'next/link';
import tw from 'twin.macro';
import Layout, { LayoutContext, SubLayoutProps } from '@src/components/Layout';
import ViewToggle from '@src/components/ViewToggle';
import { MuseumDto } from '@src/data/MuseumSerializer';
import type { GalleryViewProps } from '@src/features/gallery';
import { MuseumProvider } from '@src/providers/MuseumProvider';
import Arrow from '@src/svgs/Arrow';

export const MuseumLayout = ({ children, pageProps }: SubLayoutProps<{ museum: MuseumDto }>) => (
  <MuseumProvider museum={pageProps.museum}>
    {({ museum }) => (
      <Layout
        navOverrides={{
          center: (
            <h1 css={tw`font-serif text-3xl leading-none text-center`}>
              <Link passHref href={`/museum/${pageProps.museum.id}`}>
                <a css={tw`transform[translateY(3px)]`}>{museum.name}</a>
              </Link>
            </h1>
          ),
        }}>
        {children}
      </Layout>
    )}
  </MuseumProvider>
);

export const MuseumHomeLayout = ({
  children,
  pageProps,
}: SubLayoutProps<{ museum: MuseumDto }>) => (
  <LayoutContext.Provider
    value={{
      hideNav: () => {},
      updateNavVisibility: () => {},
      navOverrides: {
        left: (
          <Link passHref href={`/museum/${pageProps.museum.id}/about`}>
            <a>About</a>
          </Link>
        ),
        right: <ViewToggle />,
      },
    }}>
    <MuseumLayout pageProps={pageProps}>{children}</MuseumLayout>
  </LayoutContext.Provider>
);

export const MuseumAboutLayout = ({
  children,
  pageProps,
}: SubLayoutProps<{ museum: MuseumDto }>) => (
  <LayoutContext.Provider
    value={{
      hideNav: () => {},
      updateNavVisibility: () => {},
      navOverrides: {
        left: (
          <Link passHref href={`/museum/${pageProps.museum.id}`}>
            <a>Back</a>
          </Link>
        ),
      },
    }}>
    <MuseumLayout pageProps={pageProps}>{children}</MuseumLayout>
  </LayoutContext.Provider>
);

export const MuseumGalleryLayout = ({ children, pageProps }: SubLayoutProps<GalleryViewProps>) => (
  <MuseumProvider museum={pageProps.museum}>
    {({ museum }) => (
      <LayoutContext.Provider
        value={{
          hideNav: () => {},
          updateNavVisibility: () => {},
          navOverrides: {
            left: (
              <Link passHref href={`/museum/${pageProps.museum.id}`}>
                <a css={tw`flex items-center`}>
                  <span css={tw`block size-3 mr-1.5`}>
                    <Arrow />
                  </span>
                  <span>Back to map</span>
                </a>
              </Link>
            ),
          },
        }}>
        <MuseumLayout pageProps={pageProps}>{children}</MuseumLayout>
      </LayoutContext.Provider>
    )}
  </MuseumProvider>
);
