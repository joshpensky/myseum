import { Frame } from '@src/types';

export const frames: Frame[] = [
  {
    id: 1,
    src: '/img/cg-frame.png',
    dimensions: {
      width: 5.5,
      height: 7.5,
    },
    depth: 1,
    window: {
      position: {
        x: 1,
        y: 1,
      },
      dimensions: {
        width: 3.5,
        height: 5.5,
      },
    },
  },
  {
    id: 2,
    src: '/img/knight-frame.png',
    dimensions: {
      width: 17,
      height: 23,
    },
    depth: 1.5,
    window: {
      position: {
        x: 3,
        y: 3.25,
      },
      dimensions: {
        width: 11,
        height: 16.5,
      },
    },
  },
];
