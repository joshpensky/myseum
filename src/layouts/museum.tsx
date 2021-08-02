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
            <Link passHref href={`/museum/${pageProps.museum.id}`}>
              <a css={tw`flex mt-1.5 cursor-pointer`}>
                <h1 css={tw`font-serif leading-none text-center text-3xl`}>{museum.name}</h1>
              </a>
            </Link>
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
            center: (
              <Link passHref href={`/museum/${pageProps.museum.id}`}>
                <a css={tw`flex cursor-pointer -mb-1`}>
                  <h1 css={tw`font-serif leading-none text-center text-xl`}>{museum.name}</h1>
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
