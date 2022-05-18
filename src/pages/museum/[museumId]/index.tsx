import { GetServerSideProps } from 'next';
import * as z from 'zod';
import api from '@src/api/server';
import { MuseumView, MuseumViewProps } from '@src/features/museum/MuseumView';

export default MuseumView;

export const getServerSideProps: GetServerSideProps<
  MuseumViewProps,
  { museumId: string }
> = async ctx => {
  const museumId = z.string().uuid().safeParse(ctx.params?.museumId);
  if (!museumId.success) {
    return {
      notFound: true,
    };
  }

  const museum = await api.museum.findOneById(museumId.data);
  if (!museum) {
    return {
      notFound: true,
    };
  }

  const galleries = await api.gallery.findAllByMuseum(museum);

  return {
    props: {
      museum,
      galleries,
    },
  };
};
