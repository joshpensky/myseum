import { Frame } from '@prisma/client';
import { SelectionEditorPath } from '@src/features/selection';
import { Dimensions3D } from '@src/types';
import { PrismaUser, UserDto } from './user.serializer';

export interface PrismaFrame extends Frame {
  owner: Pick<PrismaUser, 'id' | 'name'>;
}

export interface FrameDto {
  id: string;
  name: string;
  src: string;
  alt: string;
  size: Dimensions3D;
  // TODO: add unit
  window: SelectionEditorPath;
  owner: Pick<UserDto, 'id' | 'name'>;
  addedAt: Date;
  modifiedAt: Date;
}

export class FrameSerializer {
  static serialize(frame: PrismaFrame): FrameDto {
    return {
      id: frame.id,
      name: frame.name,
      src: frame.src,
      alt: frame.alt,
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
      owner: frame.owner,
      addedAt: frame.addedAt,
      modifiedAt: frame.modifiedAt,
    };
  }
}
