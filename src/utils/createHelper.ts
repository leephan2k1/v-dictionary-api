//@ts-nocheck
import { prisma } from "./prismaClient";
// prisma can not nested create in createMany, LMAO:
// https://github.com/prisma/prisma/issues/5455
export async function createManySense(senses, wordId) {
  await prisma.$transaction(
    senses.map((e) => {
      return prisma.sense.create({
        data: {
          sense: e.sense,
          category: e?.category ? e?.category : undefined,
          example: e?.example
            ? { create: { en: e.example.en, vi: e.example.vi } }
            : undefined,
          typeOfWord: e?.typeOfWord
            ? {
                connectOrCreate: {
                  create: { type: e.typeOfWord },
                  where: { type: e.typeOfWord },
                },
              }
            : undefined,
          Word: {
            connect: { id: wordId },
          },
        },
      });
    })
  );
}
