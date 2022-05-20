import { Frame, MeasureUnit } from '@prisma/client';
import { prisma } from '@src/data/prisma';
import { SelectionEditorPath } from '@src/features/selection';
import { Dimensions3D } from '@src/types';
import { uploadSupabaseFile } from '@src/utils/uploadSupabaseFile';

export interface CreateFrameDto {
  ownerId: string;
  name: string;
  src: string;
  alt: string;
  size: Dimensions3D;
  unit: MeasureUnit;
  window: SelectionEditorPath;
}

export class FrameRepository {
  static async findAll() {
    const frames = await prisma.frame.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return frames;
  }

  static async findAllByUser(userId: string) {
    const frames = await prisma.frame.findMany({
      where: {
        owner: {
          id: userId,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return frames;
  }

  static async findOne(id: string) {
    const frame = await prisma.frame.findFirst({
      where: {
        id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return frame;
  }

  static async create(data: CreateFrameDto) {
    const src = await uploadSupabaseFile('frames', data.src);

    const frame = await prisma.frame.create({
      data: {
        name: data.name,
        src,
        alt: data.alt,
        width: data.size.width,
        height: data.size.height,
        depth: data.size.depth,
        unit: data.unit,
        windowX1: data.window[0].x,
        windowY1: data.window[0].y,
        windowX2: data.window[1].x,
        windowY2: data.window[1].y,
        windowX3: data.window[2].x,
        windowY3: data.window[2].y,
        windowX4: data.window[3].x,
        windowY4: data.window[3].y,
        owner: {
          connect: {
            id: data.ownerId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return frame;
  }

  static async delete(frame: Frame) {
    const deletedFrame = await prisma.frame.delete({
      where: {
        id: frame.id,
      },
    });
    return deletedFrame;
  }
}
