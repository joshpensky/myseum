import { Artwork, Id } from '@src/types';

export type RawArtwork = Omit<Artwork, 'frame'> & {
  frameId: Id;
};

export const artworks: RawArtwork[] = [
  {
    id: 1,
    title: 'Choose Goose',
    artist: null,
    description:
      'Nullam quis risus eget urna mollis ornare vel eu leo. Curabitur blandit tempus porttitor.',
    src: '/img/choose-goose.png',
    alt: 'ADD_ALT_TEXT',
    dimensions: {
      width: 3.5,
      height: 5.5,
    },
    createdAt: new Date('2019-01-01'),
    acquiredAt: new Date('2019-11-01'),
    frameId: 1,
  },
];
