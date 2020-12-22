import { Id, Museum } from '@src/types';

export const museums: Museum<Id>[] = [
  {
    id: 1,
    slug: 'c-a-seeger-museum',
    name: 'C. A. Seeger Museum',
    galleries: [
      {
        item: 1,
        position: {
          x: 0,
          y: 0,
        },
      },
    ],
    createdAt: new Date('2020-12-21'),
  },
];
