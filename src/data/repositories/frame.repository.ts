import { MeasureUnit } from '@prisma/client';
import { prisma } from '@src/data/prisma';
import { SelectionEditorPath } from '@src/features/selection';
import { Dimensions3D } from '@src/types';

export interface CreateFrameDto {
  ownerId: string;
  src: string;
  description: string;
  size: Dimensions3D;
  unit: MeasureUnit;
  window: SelectionEditorPath;
}

export class FrameRepository {
  static async findAll() {
    const frames = await prisma.frame.findMany();
    return frames;
  }

  static async create(data: CreateFrameDto) {
    const frame = await prisma.frame.create({
      data: {
        src: data.src,
        description: data.description,
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
    });
    return frame;
  }
}