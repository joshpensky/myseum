import { Gallery, Id } from '@src/types';

export const galleries: Gallery<Id>[] = [
  {
    id: 1,
    slug: 'fine-r-gallery',
    name: 'Fine R. Gallery',
    color: 'mint',
    height: 40,
    artworks: [
      {
        item: 1,
        position: {
          x: 3,
          y: 25,
        },
      },
      {
        item: 2,
        position: {
          x: 35,
          y: 0,
        },
      },
    ],
    createdAt: new Date('2020-12-21'),
  },
  {
    id: 2,
    slug: 'steven-uni-verse-gallery',
    name: 'Steven Uni Verse Gallery',
    color: 'navy',
    height: 28,
    artworks: [
      {
        item: 1,
        position: {
          x: 5,
          y: 10,
        },
      },
    ],
    createdAt: new Date('2020-12-21'),
  },
];
