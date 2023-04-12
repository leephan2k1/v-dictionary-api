import type { Request, Response, NextFunction } from "express";
import axios from "axios";
import { parse } from "node-html-parser";
import { getAudioInfo } from "../utils/getAudio";
import { GLOSBE_API, GLOSBE_URL } from "../configs";
import { normalizeString } from "../utils/string";
import type { Source } from "../types";

interface SearchQuery {
  word: string;
  format: "vi-en" | "en-vi";
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
  req: Request<Pick<SearchQuery, "word">, {}, {}, Pick<SearchQuery, "format">>,
  res: Response,
  next: NextFunction
) {
  try {
    const { word } = req.params;
    const { format } = req.query;
    const _format_ = format.split("-");

    if (!word) throw new Error("word missing");
    if (!format) throw new Error("format missing");

    const raw = await (
      await axios.get(`${GLOSBE_URL}/${_format_[0]}/${_format_[1]}/${word}`)
    ).data;
    const document = parse(raw);

    const wordContent = document.querySelector("span.break-words")?.textContent;
    const typesOfWord = document
      .querySelectorAll(
        "#phraseDetails_activator-0 > div.text-xl.text-gray-900.px-1.pb-1 > span.text-xxs.text-gray-500 > span"
      )
      .map((e) => e?.textContent);
    const senses = document
      .querySelectorAll(
        "#dictionary-content > article > div > div > section.bg-white.px-1 > div.pl-1 > div > ul.pr-1 > li"
      )
      .map((li) => {
        const sense = li.querySelector("h3")?.textContent;
        const typeOfWord = li.querySelector(
          "span.text-xxs.text-gray-500 > span"
        )?.textContent;
        const topic = li.querySelector("div.py-1 > p > span");

        const example = {
          [_format_[0]]: normalizeString(
            String(li.querySelector("div > p.dir-aware-pr-1")?.textContent)
          ),
          [_format_[1]]: normalizeString(
            String(li.querySelector("div > p.px-1.ml-2")?.textContent)
          ),
        };
        return {
          sense,
          typeOfWord,
          category: topic ? normalizeString(String(topic).trim()) : undefined,
          example,
        };
      });

    const less_frequent_senses = document
      .querySelectorAll(
        "#less-frequent-translations-container-0 > li > div:nth-child(2) > ul > li"
      )
      .map((li) => li?.textContent);

    const similar_phrases = document
      .querySelectorAll("#simmilar-phrases > ul > li")
      .map((li) => {
        return {
          [_format_[0]]: li.querySelector("a")?.textContent,
          [_format_[1]]: normalizeString(
            String(li.querySelector(".dir-aware-pl-2")?.textContent)
          ),
        };
      });

    const examples = document
      .querySelectorAll(
        "#tmem_first_examples > div.px-1.text-sm.text-gray-900.break-words > div > div.py-2.flex"
      )
      .map((div) => {
        return {
          [_format_[0]]: normalizeString(
            String(div.querySelector("div:nth-child(1)")?.textContent)
          ),
          [`keyword_${_format_[0]}`]: normalizeString(
            String(div.querySelector("div:nth-child(1) .keyword")?.textContent)
          ),
          [_format_[1]]: normalizeString(
            String(div.querySelector("div:nth-child(2)")?.textContent)
          ),
          [`keyword_${_format_[1]}`]: normalizeString(
            String(div.querySelector("div:nth-child(2) .keyword")?.textContent)
          ),
        };
      });

    if (typesOfWord && wordContent && senses) {
      return res.status(200).json({
        wordContent,
        typesOfWord,
        senses,
        less_frequent_senses,
        similar_phrases,
        examples,
      });
    }

    return res.status(404).json({ message: "word detail not found" });
  } catch (error) {
    console.log("INFO ERROR: ", error);
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
