import axios from "axios";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prismaClient";
import { GLOSBE_API } from "../configs";
import {
  translateWordGlosbe,
  machineTranslation,
  getGrammarGlosbe,
  translateOxford,
  translateCambridge,
} from "../libs";
import { getAudioInfo } from "../utils/getAudio";
import { createManySense } from "../utils/createHelper";

import type { Language, LanguagePairs, Source } from "../types";
interface SearchQuery {
  word: string;
  format: LanguagePairs;
  sensesFormat: Language;
}

interface AudioQuery {
  source: Source;
}

export async function search(
  req: Request<{}, {}, {}, SearchQuery>,
  res: Response,
  next: NextFunction
) {
  const { format, word } = req.query;
  const _format_ = format.split("-");

  try {
    if (!format || !word) throw new Error("missing query [format, word]");

    const resData = await (
      await axios.get(
        `${GLOSBE_API}/iapi3/wordlist?l1=${_format_[0]}&l2=${_format_[1]}&q=${word}&after=20&before=0&env=vi`
      )
    ).data;

    if (resData?.after && Array.isArray(resData?.after)) {
      const words = resData?.after.map((e: any) => String(e?.phrase));
      return res.status(200).json({ words });
    }

    return res.status(404).json({ message: "word not found" });
  } catch (error) {
    console.log("SEARCH ERROR: ", error);
    next();
  }
}

export async function getWordDetail(
  req: Request<
    Pick<SearchQuery, "word">,
    {},
    {},
    Pick<SearchQuery, "format"> & AudioQuery
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const { word } = req.params;
    const { format, source } = req.query;
    const _format_ = format.split("-");

    if (!word) throw new Error("word missing");
    if (!format) throw new Error("format missing");

    //get word from "cache":
    const wordDb = await prisma.word.findUnique({
      where: { wordContent: word },
      include: {
        examples: true,
        senses: { include: { example: true, typeOfWord: true } },
        less_frequent_senses: true,
        similar_phrases: true,
        typesOfWord: { select: { type: true } },
      },
    });

    //"cache hit"
    if (wordDb) {
      return res.status(200).json({
        ...wordDb,
        typesOfWord: wordDb.typesOfWord.map((e) => e.type),
        senses: wordDb.senses.map((s) => ({
          ...s,
          typeOfWord: s.typeOfWord?.type,
        })),
        less_frequent_senses: wordDb.less_frequent_senses.map((e) => e.sense),
      });
    }

    //@ts-ignore
    let resData;
    console.time(`time scrape ${word}`);
    if (format === "en-en") {
      if (source === "cambridge") {
        resData = await translateCambridge({ word });
      } else {
        resData = await translateOxford({ word });
      }
    } else {
      resData = await translateWordGlosbe({
        language_1: _format_[0] as Language,
        language_2: _format_[1] as Language,
        word,
      });
    }
    console.timeEnd(`time scrape ${word}`);

    if (resData) {
      //cache data:
      try {
        setTimeout(async () => {
          const word = await prisma.word.create({
            data: {
              format,
              //@ts-ignore
              wordContent: resData.wordContent,

              typesOfWord:
                //@ts-ignore
                resData.typesOfWord && resData.typesOfWord.length > 0
                  ? {
                      createMany: {
                        //@ts-ignore
                        data: resData.typesOfWord.map((e) => ({ type: e })),
                        skipDuplicates: true,
                      },
                    }
                  : undefined,
              less_frequent_senses:
                //@ts-ignore
                resData?.less_frequent_senses &&
                //@ts-ignore
                resData?.less_frequent_senses.length > 0
                  ? {
                      createMany: {
                        //@ts-ignore
                        data: resData?.less_frequent_senses.map((e) => ({
                          sense: e,
                        })),
                      },
                    }
                  : undefined,
              similar_phrases:
                //@ts-ignore
                resData?.similar_phrases && resData?.similar_phrases.length > 0
                  ? {
                      createMany: {
                        //@ts-ignore
                        data: resData?.similar_phrases.map((e) => ({
                          en: e.en,
                          vi: e.vi,
                        })),
                      },
                    }
                  : undefined,
              examples:
                //@ts-ignore
                resData?.examples && resData.examples.length > 0
                  ? {
                      createMany: {
                        //@ts-ignore
                        data: resData.examples.map((e) => ({
                          en: e.en,
                          vi: e.vi,
                          keyword_en: e?.keyword_en,
                          keyword_vi: e?.keyword_vi,
                        })),
                      },
                    }
                  : undefined,
            },
          });
          //@ts-ignore
          await createManySense(resData.senses, word.id);
        }, 500);
      } catch (error) {
        console.log("cache ERROR: ", error);
      }

      return res.status(200).json(resData);
    } else {
      return res.status(404).json({ message: "word detail not found" });
    }
  } catch (error) {
    console.log("getWordDetail: ", error);
    next();
  }
}

export async function getGrammar(
  req: Request<Pick<SearchQuery, "word">, {}, {}, {}>,
  res: Response,
  next: NextFunction
) {
  const { word } = req.params;

  const resData = await getGrammarGlosbe({ word });

  if (resData) {
    return res.status(200).json({ grammars: resData });
  } else {
    return res.status(404).json({ message: "grammars not found" });
  }
}

export async function getWordDetailByMachine(
  req: Request<{}, {}, { sentence: string }, Pick<SearchQuery, "format">>,
  res: Response,
  next: NextFunction
) {
  const { sentence } = req.body;
  const { format } = req.query;
  const _format_ = format.split("-");

  if (!sentence) throw new Error("word missing");
  if (!format) throw new Error("format missing");

  try {
    const resData = await machineTranslation({
      language_1: _format_[0] as Language,
      language_2: _format_[1] as Language,
      word: sentence,
    });

    if (resData) {
      return res.status(200).json(resData);
    }

    return res
      .status(404)
      .json({ message: "word detail by machine not found" });
  } catch (error) {
    console.log("getWordDetailByMachine error: ", error);
    next();
  }
}

export async function getAudio(
  req: Request<Pick<SearchQuery, "word">, {}, {}, AudioQuery>,
  res: Response,
  next: NextFunction
) {
  try {
    const { word } = req.params;
    const { source } = req.query;

    const audios = await getAudioInfo({ word, format: "en", source });

    return res.status(200).json({ audios });
  } catch (error) {}
}
