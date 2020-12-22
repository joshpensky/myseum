import { setupWorker, rest } from 'msw';
import { artworks } from './data/artworks';
import { museums } from './data/museums';
import { galleries } from './data/galleries';
import { frames } from './data/frames';
import { Artwork, Gallery, Id, Museum, MuseumCollectionItem } from '@src/types';

const getArtwork = (id: Id): Artwork => {
  const work = artworks.find(work => id === work.id);
  if (!work) {
    throw new Error('Artwork not found!');
  }

  const frame = frames.find(({ id }) => id === work.frameId);
  if (!frame) {
    throw new Error('Frame not found!');
  }

  return {
    ...work,
    frame,
  };
};

const getGallery = (id: Id): Gallery => {
  const gallery = galleries.find(gallery => id === gallery.id);
  if (!gallery) {
    throw new Error('Gallery not found!');
  }

  const artworks: Gallery['artworks'] = gallery.artworks.map(({ item, ...data }) => ({
    ...data,
    item: getArtwork(item),
  }));

  return {
    ...gallery,
    artworks,
  };
};

const getMuseum = (id: Id): Museum => {
  const museum = museums.find(museum => id === museum.id);
  if (!museum) {
    throw new Error('Museum not found!');
  }

  const galleries: Museum['galleries'] = museum.galleries.map(({ item, ...data }) => ({
    ...data,
    item: getGallery(item),
  }));

  return {
    ...museum,
    galleries,
  };
};

const getMuseumCollection = (museum: Museum) => {
  const artworkIdSet = new Set<number>();
  const uniqueArtwork: MuseumCollectionItem[] = [];

  museum.galleries.forEach(({ item }) => {
    const { artworks, ...gallery } = item;
    artworks.forEach(({ item }) => {
      if (!artworkIdSet.has(item.id)) {
        uniqueArtwork.push({
          ...item,
          gallery,
        });
      }
    });
  });

  return uniqueArtwork;
};

export const mockServiceWorker = setupWorker(
  // Museum mock
  rest.get('/api/museums/:museumId', (req, res, ctx) => {
    const { museumId } = req.params;

    try {
      const museum = getMuseum(museumId);
      return res(ctx.status(200), ctx.json(museum));
    } catch {
      return res(ctx.status(404));
    }
  }),

  // Museum collection mock
  rest.get('/api/museums/:museumId/collection', (req, res, ctx) => {
    const { museumId } = req.params;

    try {
      const museum = getMuseum(museumId);
      const collection = getMuseumCollection(museum);
      return res(ctx.status(200), ctx.json(collection));
    } catch {
      return res(ctx.status(404));
    }
  }),

  // Gallery mock
  rest.get('/api/galleries/:galleryId', (req, res, ctx) => {
    const { galleryId } = req.params;

    try {
      const gallery = getGallery(galleryId);
      return res(ctx.status(200), ctx.json(gallery));
    } catch {
      return res(ctx.status(404));
    }
  }),
);
