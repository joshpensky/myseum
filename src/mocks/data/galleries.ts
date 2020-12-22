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
      // {
      //   position: {
      //     x: 36,
      //     y: 3,
      //   },
      // },
      // {
      //   position: {
      //     x: 57,
      //     y: 11,
      //   },
      // },
      // {
      //   position: {
      //     x: 48,
      //     y: 40,
      //   },
      // },
      // {
      //   position: {
      //     x: 80,
      //     y: 52,
      //   },
      // },
    ],
    createdAt: new Date('2020-12-21'),
  },
];
