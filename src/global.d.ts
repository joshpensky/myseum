import { PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    export interface Global {
      prisma?: PrismaClient;
    }
  }
}
