
import { PrismaClient, Url, Click } from '@prisma/client';

export const prisma = new PrismaClient();
export type { Url, Click };
