import { Artwork, Id } from '@src/types';

export type RawArtwork = Omit<Artwork, 'artist' | 'frame'> & {
  artistId: Id | null;
  frameId: Id;
};

export const artworks: RawArtwork[] = [
  {
    id: 1,
    title: 'Choose Goose',
    artistId: null,
    description:
      'Nullam quis risus eget urna mollis ornare vel eu leo. Curabitur blandit tempus porttitor.',
    src: '/img/choose-goose.png',
    alt: 'TODO: ADD_ALT_TEXT',
    dimensions: {
      width: 3.5,
      height: 5.5,
    },
    createdAt: new Date('2019-01-01'),
    acquiredAt: new Date('2019-11-01'),
    frameId: 1,
  },
  {
    id: 2,
    title: 'Golden Knight',
    artistId: 1,
    description:
      'Nullam quis risus eget urna mollis ornare vel eu leo. Curabitur blandit tempus porttitor.',
    src: '/img/knight.png',
    alt: 'TODO: ADD_ALT_TEXT',
    dimensions: {
      width: 13,
      height: 19,
    },
    createdAt: new Date('2018-07-02'),
    acquiredAt: new Date('2019-11-21'),
    frameId: 2,
  },
];
