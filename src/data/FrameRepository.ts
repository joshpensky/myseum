import { Frame } from '@prisma/client';
import { prisma } from '@src/data/prisma';

export type CreateFrameDto = Omit<Frame, 'id'>;

export class FrameRepository {
  static async findAll() {
    const frames = await prisma.frame.findMany();
    return frames;
  }

  static async create(data: CreateFrameDto) {
    const frame = await prisma.frame.create({
      data,
    });
    return frame;
  }
}
