import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prismaClient";

export async function handleGetUserInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("handleGetUserInfo ERROR: ", error);
    return res.status(500).json("ERROR");
  }
}

interface TranslationHistoryBody {
  word: string;
  sense: string;
  currentLanguage: string;
  targetLanguage: string;
  translations_history: TranslationHistoryBody[];
}

export async function handleDeleteFavorite(
  req: Request<{}, {}, { word: string }>,
  res: Response,
  next: NextFunction
) {
  const { word } = req.body;
  const { user } = req;

  try {
    const deletedStatus = await prisma.practice.delete({
      where: {
        userId_wordContent: {
          //@ts-ignore
          userId: user.id,
          wordContent: word,
        },
      },
    });

    return res.status(200).json(deletedStatus);
  } catch (error) {
    console.error(`handleCreateFavorite: ${error}`);
    next("handleCreateFavorite ERROR");
  }
}

export async function handleCreateFavorite(
  req: Request<
    {},
    {},
    { word: string; tag?: string; numberOfDaysToForget?: number }
  >,
  res: Response,
  next: NextFunction
) {
  const { word, numberOfDaysToForget, tag } = req.body;
  const { user } = req;

  try {
    const practiceWord = await prisma.practice.upsert({
      where: {
        userId_wordContent: {
          //@ts-ignore
          userId: user.id,
          wordContent: word,
        },
      },
      create: {
        word: { connect: { wordContent: word } },
        //@ts-ignore
        user: { connect: { id: user.id } },
        numberOfDaysToForget,
        tag,
      },
      update: {},
    });

    return res.status(201).json(practiceWord);
  } catch (error) {
    console.error(`handleCreateFavorite: ${error}`);
    next("handleCreateFavorite ERROR");
  }
}

export async function handleGetInfoFavorite(
  req: Request<{}, {}, {}, { word: string }>,
  res: Response,
  next: NextFunction
) {
  const { word } = req.query;
  const { user } = req;

  try {
    const practiceWord = await prisma.practice.findUnique({
      where: {
        userId_wordContent: {
          //@ts-ignore
          userId: user.id,
          wordContent: word,
        },
      },
      select: {
        createdAt: true,
      },
    });

    return res.status(200).json(practiceWord);
  } catch (error) {
    console.error(`handleGetInfoFavorite: ${error}`);
    next("handleGetInfoFavorite ERROR");
  }
}

export async function handleCreateTranslationHistory(
  req: Request<{}, {}, TranslationHistoryBody, {}>,
  res: Response,
  next: NextFunction
) {
  const { word, sense, currentLanguage, targetLanguage, translations_history } =
    req.body;
  const { user } = req;

  try {
    //multiple create:
    if (translations_history && translations_history.length > 0) {
      const tHistory = await prisma.translationHistory.createMany({
        data: translations_history.map((e) => ({
          word: e.word,
          sense: e.sense,
          currentLanguage: e.currentLanguage,
          targetLanguage: e.targetLanguage,
          //@ts-ignore
          userId: user.id,
        })),
        skipDuplicates: true,
      });

      return res.status(201).json(tHistory);
    }

    //single create:
    const tHistory = await prisma.translationHistory.upsert({
      where: {
        userId_word: {
          //@ts-ignore
          userId: user.id,
          word,
        },
      },
      create: {
        word,
        sense,
        currentLanguage,
        targetLanguage,
        //@ts-ignore
        userId: user.id,
      },
      update: {},
    });

    return res.status(201).json(tHistory);
  } catch (error) {
    console.error(`handleCreateTranslationHistory: ${error}`);
    next("handleCreateTranslationHistory ERROR");
  }
}

export async function handleGetTranslationHistory(
  req: Request<{}, {}, {}, { page: number; limit: number }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { user } = req;
    let { page, limit } = req.query;

    if (!page) page = 1;
    if (!limit) limit = 18;

    const [translations, totalRecords] = await prisma.$transaction([
      prisma.translationHistory.findMany({
        //@ts-ignore
        where: { userId: user.id },
        orderBy: {
          createdAt: "desc",
        },
        take: Number(limit),
        skip: (Number(page) - 1) * limit,
      }),
      prisma.translationHistory.count({
        //@ts-ignore
        where: { userId: user.id },
      }),
    ]);

    return res
      .status(200)
      .json({ translations, totalPages: Math.ceil(totalRecords / limit) });
  } catch (error) {
    console.error(`handleGetTranslationHistory: ${error}`);
    next("handleGetTranslationHistory ERROR");
  }
}

export async function handleDeleteTranslationHistory(
  req: Request<{}, {}, { word: string; deleteOption: string }, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const { word, deleteOption } = req.body;
    const { user } = req;

    if (deleteOption === "deleteAll") {
      const deleteStatus = await prisma.translationHistory.deleteMany({
        //@ts-ignore
        where: { userId: user.id },
      });

      return res.status(200).json({ deleteStatus });
    }

    const deleteStatus = await prisma.translationHistory.delete({
      where: {
        userId_word: {
          word,
          //@ts-ignore
          userId: user.id,
        },
      },
    });

    return res.status(200).json({ deleteStatus });
  } catch (error) {
    console.error(`handleDeleteTranslationHistory: ${error}`);
    next("handleDeleteTranslationHistory ERROR");
  }
}
