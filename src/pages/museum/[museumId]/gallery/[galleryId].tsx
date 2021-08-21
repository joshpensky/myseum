import { ParsedUrlQuery } from 'querystring';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import tw from 'twin.macro';
import { pages } from '@next/pages';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/GalleryRepository';
import { GallerySerializer } from '@src/data/GallerySerializer';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { MuseumSerializer } from '@src/data/MuseumSerializer';
import { GalleryView, GalleryViewProps } from '@src/features/gallery';
import { MuseumLayout, MuseumLayoutProps } from '@src/layouts/MuseumLayout';
import Arrow from '@src/svgs/Arrow';
import { PageComponent } from '@src/types';

type GalleryPageProps = GalleryViewProps;

const GalleryPage: PageComponent<GalleryPageProps, MuseumLayoutProps> = GalleryView;

GalleryPage.layout = MuseumLayout;
GalleryPage.getPageLayoutProps = pageProps => ({
  museum: pageProps.museum,
  forGallery: true,
});
GalleryPage.getGlobalLayoutProps = pageProps => ({
  navOverrides: {
    left: (
      <Link passHref href={pages.museum(pageProps.museum.id).index}>
        <a css={tw`flex items-center`}>
          <span css={tw`block size-3 mr-1.5`}>
            <Arrow />
          </span>
          <span>Back to map</span>
        </a>
      </Link>
    ),
  },
});

export default GalleryView;

interface GalleryPageParams extends ParsedUrlQuery {
  museumId: string;
  galleryId: string;
}

export const getServerSideProps: GetServerSideProps<
  GalleryPageProps,
  GalleryPageParams
> = async ctx => {
  const museumId = z.number().int().safeParse(Number(ctx.params?.museumId));
  const galleryId = z.number().int().safeParse(Number(ctx.params?.galleryId));
  if (!museumId.success || !galleryId.success) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = await MuseumRepository.findOne(museumId.data);
    if (!museum) {
      throw new Error('Museum not found.');
    }
    const gallery = await GalleryRepository.findOneByMuseum(museumId.data, galleryId.data);
    if (!gallery) {
      throw new Error('Gallery not found.');
    }

    return {
      props: {
        museum: MuseumSerializer.serialize(museum),
        gallery: GallerySerializer.serialize(gallery),
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
