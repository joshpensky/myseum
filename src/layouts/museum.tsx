import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import tw from 'twin.macro';
import Layout, { LayoutContext, SubLayoutProps } from '@src/components/Layout';
import ViewToggle from '@src/components/ViewToggle';
import type { MuseumMapViewProps } from '@src/pages/museum/[museumId]';
import type { GalleryViewProps } from '@src/pages/museum/[museumId]/gallery/[galleryId]';
import { useAuth } from '@src/providers/AuthProvider';
import { MuseumProvider } from '@src/providers/MuseumProvider';
import Arrow from '@src/svgs/Arrow';

export const MuseumLayout = ({ children, pageProps }: SubLayoutProps<MuseumMapViewProps>) => {
  const auth = useAuth();
  const router = useRouter();

  // Update to public museum path if user logs out
  useEffect(() => {
    if (auth.didLogOut && pageProps.basePath === '/museum') {
      const publicPath = router.asPath.replace(`/museum`, `/museum/${pageProps.museum.id}`);
      router.replace(publicPath, undefined, {
        shallow: true,
      });
    }
  }, [auth.didLogOut]);

  return (
    <MuseumProvider basePath={pageProps.basePath} museum={pageProps.museum}>
      {({ museum }) => (
        <Layout
          navOverrides={{
            center: (
              <Link passHref href={{ pathname: pageProps.basePath }}>
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
};

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

export const MuseumGalleryLayout = ({ children, pageProps }: SubLayoutProps<GalleryViewProps>) => (
  <MuseumProvider basePath={pageProps.basePath} museum={pageProps.museum}>
    {({ museum }) => (
      <LayoutContext.Provider
        value={{
          navOverrides: {
            left: (
              <Link passHref href={{ pathname: pageProps.basePath }}>
                <a css={tw`flex items-center`}>
                  <span css={tw`block size-3 mr-1.5`}>
                    <Arrow />
                  </span>
                  <span>Back to map</span>
                </a>
              </Link>
            ),
            center: (
              <Link passHref href={{ pathname: pageProps.basePath }}>
                <a css={tw`flex cursor-pointer -mb-1`}>
                  <h1 css={tw`font-serif leading-none text-center text-lg`}>{museum.name}</h1>
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
