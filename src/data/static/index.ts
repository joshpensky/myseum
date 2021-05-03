import { artists } from '@src/data/static/artists';
import { artworks } from '@src/data/static/artworks';
import { frames } from '@src/data/static/frames';
import { galleries } from '@src/data/static/galleries';
import { museums } from '@src/data/static/museums';
import { Artist, Artwork, Gallery, Id, Museum, MuseumCollectionItem } from '@src/types';

export const getArtwork = (id: Id): Artwork => {
  const work = artworks.find(work => id === work.id);
  if (!work) {
    throw new Error('Artwork not found!');
  }

  const { frameId, artistId, ...artwork } = work;

  const frame = frames.find(({ id }) => id === frameId);
  if (!frame) {
    throw new Error('Frame not found!');
  }

  let artist: Artist | null = null;
  if (artistId !== null) {
    const foundArtist = artists.find(({ id }) => id === artistId);
    if (!foundArtist) {
      throw new Error('Artist not found!');
    }
    artist = foundArtist;
  }

  return {
    ...artwork,
    artist,
    frame,
  };
};

export const getGallery = (id: Id): Gallery => {
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

export const getMuseum = (id: Id): Museum => {
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

export const getMuseumCollection = (museum: Museum) => {
  const artworkIdSet = new Set<number>();
  const uniqueArtwork: MuseumCollectionItem[] = [];

  museum.galleries.forEach(({ item }) => {
    const { artworks, ...gallery } = item;
    artworks.forEach(({ item }) => {
      if (!artworkIdSet.has(item.id)) {
        artworkIdSet.add(item.id);
        uniqueArtwork.push({
          ...item,
          gallery,
        });
      }
    });
  });

  return uniqueArtwork;
};

// export const mockServiceWorker = setupWorker(
//   // Museum mock
//   rest.get('/api/museums/:museumId', (req, res, ctx) => {
//     const { museumId } = req.params;

//     try {
//       const museum = getMuseum(Number(museumId));
//       return res(ctx.status(200), ctx.json(museum));
//     } catch {
//       return res(ctx.status(404), ctx.json({ message: 'Museum not found' }));
//     }
//   }),

//   // Museum collection mock
//   rest.get('/api/museums/:museumId/collection', (req, res, ctx) => {
//     const { museumId } = req.params;

//     try {
//       const museum = getMuseum(Number(museumId));
//       const collection = getMuseumCollection(museum);
//       return res(ctx.status(200), ctx.json(collection));
//     } catch {
//       return res(ctx.status(404), ctx.json({ message: 'Museum not found' }));
//     }
//   }),

//   // Gallery mock
//   rest.get('/api/galleries/:galleryId', (req, res, ctx) => {
//     const { galleryId } = req.params;

//     try {
//       const gallery = getGallery(Number(galleryId));
//       return res(ctx.status(200), ctx.json(gallery));
//     } catch {
//       return res(ctx.status(404), ctx.json({ message: 'Gallery not found' }));
//     }
//   }),
// );
