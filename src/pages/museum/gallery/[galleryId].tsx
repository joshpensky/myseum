import { GetServerSideProps } from 'next';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { getGallery } from '@src/data/static';
import { supabase } from '@src/data/supabase';
import { GalleryViewProps } from '@src/pages/museum/[museumId]/gallery/[galleryId]';

export { default } from '@src/pages/museum/[museumId]/gallery/[galleryId]';

export const getServerSideProps: GetServerSideProps<
  GalleryViewProps,
  { museumId: string; galleryId: string }
> = async ctx => {
  const auth = await supabase.auth.api.getUserByCookie(ctx.req);

  if (!auth.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    const museum = await MuseumRepository.findByUser(auth.user);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    // TODO: replace with actual data once artwork is implemented
    const gallery = getGallery(1);

    return {
      props: {
        basePath: `/museum`,
        museum: JSON.parse(JSON.stringify(museum)),
        gallery: JSON.parse(JSON.stringify(gallery)),
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
