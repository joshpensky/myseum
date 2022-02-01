import { GetServerSideProps } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';
import { MuseumSerializer } from '@src/data/serializers/museum.serializer';
import { MuseumView, MuseumViewProps } from '@src/features/museum/MuseumView';

export default MuseumView;

export const getServerSideProps: GetServerSideProps<
  MuseumViewProps,
  { museumId: string }
> = async ctx => {
  const museumId = z.number().int().safeParse(Number(ctx.params?.museumId));
  if (!museumId.success) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = await MuseumRepository.findOne(museumId.data);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    const serializedMuseum = MuseumSerializer.serialize(museum);

    const galleries = await GalleryRepository.findAllByMuseum(museum.id);
    const serializedGalleries = galleries.map(gallery => GallerySerializer.serialize(gallery));

    return {
      props: {
        museum: serializedMuseum,
        galleries: serializedGalleries,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
