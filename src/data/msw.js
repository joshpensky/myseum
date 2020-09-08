import { setupWorker, rest } from 'msw';
import artwork from './artwork';
import museums from './museums';
import galleries from './galleries';
import frames from './frames';

const getArtwork = id => {
  const work = artwork.find(work => id === work.id);

  return {
    ...work,
    frame: frames.find(({ id }) => id === work.frame),
  };
};

const getGallery = id => {
  const gallery = galleries.find(gallery => id === gallery.id);

  return {
    ...gallery,
    artwork: gallery.artwork.map(({ item, ...data }) => ({
      ...data,
      item: getArtwork(item),
    })),
  };
};

const worker = setupWorker(
  // Museum mock
  rest.get('/api/museums/:museumId', (req, res, ctx) => {
    const { museumId } = req.params;

    const museum = museums.find(({ id }) => museumId === id);

    if (museum) {
      return res(
        ctx.status(200),
        ctx.json({
          ...museum,
          galleries: museum.galleries.map(({ item, ...data }) => ({
            ...data,
            item: getGallery(item),
          })),
        }),
      );
    }

    return res(ctx.status(404));
  }),
  // Museum mock
  rest.get('/api/museums/:museumId/collection', (req, res, ctx) => {
    const { museumId } = req.params;

    const museum = museums.find(({ id }) => museumId === id);

    const artworkIdSet = new Set();

    const uniqueArtwork = museum.galleries.reduce((acc, { item }) => {
      const { artwork, ...gallery } = getGallery(item);
      artwork.forEach(({ item }) => {
        if (!artworkIdSet.has(item.id)) {
          acc.push({
            ...item,
            gallery,
          });
        }
      });
      return acc;
    }, []);

    if (museum) {
      return res(ctx.status(200), ctx.json(uniqueArtwork));
    }

    return res(ctx.status(404));
  }),

  // Gallery mock
  rest.get('/api/galleries/:galleryId', (req, res, ctx) => {
    const { galleryId } = req.params;

    const gallery = getGallery(galleryId);

    if (gallery) {
      return res(ctx.status(200), ctx.json(gallery));
    }

    return res(ctx.status(404));
  }),
);

export default worker;
