import { Frame } from '@prisma/client';
import { Dimensions3D, Position } from '@src/types';

export interface FrameDto {
  id: number;
  src: string;
  description: string;
  size: Dimensions3D;
  window: [Position, Position, Position, Position];
}

export class FrameSerializer {
  static serialize(frame: Frame): FrameDto {
    return {
      id: frame.id,
      src: frame.src,
      description: frame.description,
      size: {
        width: frame.width,
        height: frame.height,
        depth: frame.depth,
      },
      window: [
        {
          x: frame.windowX1,
          y: frame.windowY1,
        },
        {
          x: frame.windowX2,
          y: frame.windowY2,
        },
        {
          x: frame.windowX3,
          y: frame.windowY3,
        },
        {
          x: frame.windowX4,
          y: frame.windowY4,
        },
      ],
    };
  }
}
