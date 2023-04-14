import axios from "axios";
import type { NextFunction, Request, Response } from "express";

import { GLOSBE_API } from "../configs";
import {
  translateWordGlosbe,
  machineTranslation,
  getGrammarGlosbe,
  translateOxford,
  translateCambridge,
} from "../libs";
import { getAudioInfo } from "../utils/getAudio";

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

    if (format === "en-en") {
      if (source === "cambridge") {
        const resData = await translateCambridge({ word });
        if (resData) return res.status(200).json(resData);
      } else {
        const resData = await translateOxford({ word });
        if (resData) return res.status(200).json(resData);
      }
    } else {
      const resData = await translateWordGlosbe({
        language_1: _format_[0] as Language,
        language_2: _format_[1] as Language,
        word,
      });
      if (resData) return res.status(200).json(resData);
    }

    return res.status(404).json({ message: "word detail not found" });
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
  req: Request<Pick<SearchQuery, "word">, {}, {}, Pick<SearchQuery, "format">>,
  res: Response,
  next: NextFunction
) {
  const { word } = req.params;
  const { format } = req.query;
  const _format_ = format.split("-");

  if (!word) throw new Error("word missing");
  if (!format) throw new Error("format missing");

  try {
    const resData = await machineTranslation({
      language_1: _format_[0] as Language,
      language_2: _format_[1] as Language,
      word,
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
