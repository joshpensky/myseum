import { Frame } from '@src/types';

export const frames: Frame[] = [
  {
    id: 1,
    src: '/img/cg-frame-2.png',
    description: 'ADD_ALT_TEXT',
    dimensions: {
      width: 5.5,
      height: 7.5,
    },
    depth: 1,
    window: [
      {
        x: 1,
        y: 1.05,
      },
      {
        x: 4.45,
        y: 1.075,
      },
      {
        x: 4.45,
        y: 6.5,
      },
      {
        x: 1,
        y: 6.5,
      },
    ],
  },
  {
    id: 2,
    src: '/img/knight-frame.png',
    description: 'ADD_ALT_TEXT',
    dimensions: {
      width: 17,
      height: 23,
    },
    depth: 1.5,
    window: [
      {
        x: 3,
        y: 3.25,
      },
      {
        x: 14,
        y: 3.25,
      },
      {
        x: 14,
        y: 19.75,
      },
      {
        x: 3,
        y: 19.75,
      },
    ],
  },
];
