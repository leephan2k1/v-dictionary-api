import axios from "axios";
import { GLOSBE_URL, GLOSBE_TRANSLATOR_API } from "../configs";
import type { Language } from "../types";
import { parse } from "node-html-parser";
import { normalizeString } from "../utils/string";
import { translate } from "@vitalets/google-translate-api";
import { googleTranslate } from "./google.dictionary";

export async function getAudioGlosbe({
  format,
  word,
}: {
  format: Language;
  word: string;
}) {
  let raw_phonetics;
  let phonetics;

  try {
    raw_phonetics = await (
      await axios.get(`${GLOSBE_URL}/api/audios/${format}/${word}`)
    ).data;

    phonetics = raw_phonetics?.phraseAudioCarrier?.audioEntries?.map(
      (entry: any) => {
        return {
          phrase: entry.phrase,
          author: entry.author.name,
          url: `${GLOSBE_URL}/fb_aud/mp3/${entry.url.mp3}`,
        };
      }
    );
  } catch (error) {
    console.error("get audio glosbe error: ", error);
  }

  return phonetics;
}

export async function translateWordGlosbe({
  language_1,
  language_2,
  word,
}: {
  language_1: Language;
  language_2: Language;
  word: string;
}) {
  try {
    const raw = await (
      await axios.get(`${GLOSBE_URL}/${language_1}/${language_2}/${word}`)
    ).data;

    //@ts-ignore
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

        // check if word has example or not:
        const example = li.querySelector("div > p.dir-aware-pr-1")
          ? {
              [language_1]: normalizeString(
                String(li.querySelector("div > p.dir-aware-pr-1")?.textContent)
              ),
              [language_2]: normalizeString(
                String(li.querySelector("div > p.px-1.ml-2")?.textContent)
              ),
            }
          : undefined;

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
          [language_1]: li.querySelector("a")?.textContent,
          [language_2]: normalizeString(
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
          [language_1]: normalizeString(
            String(div.querySelector("div:nth-child(1)")?.textContent)
          ),
          [`keyword_${language_1}`]: div.querySelector(
            "div:nth-child(1) .keyword"
          )
            ? normalizeString(
                String(
                  div.querySelector("div:nth-child(1) .keyword")?.textContent
                )
              )
            : undefined,

          [language_2]: normalizeString(
            String(div.querySelector("div:nth-child(2)")?.textContent)
          ),
          [`keyword_${language_2}`]: div.querySelector(
            "div:nth-child(2) .keyword"
          )
            ? normalizeString(
                String(
                  div.querySelector("div:nth-child(2) .keyword")?.textContent
                )
              )
            : undefined,
        };
      });

    if (typesOfWord && wordContent && senses) {
      return {
        wordContent,
        typesOfWord,
        senses,
        less_frequent_senses,
        similar_phrases,
        examples,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.log("glosbe translate error: ", error);
    return null;
  }
}

export async function machineTranslation({
  language_1,
  language_2,
  word,
}: {
  language_1: Language;
  language_2: Language;
  word: string;
}) {
  try {
    const [google] = await Promise.allSettled([
      // (
      //   await axios.post(
      //     `${GLOSBE_TRANSLATOR_API}/translateByLangWithScore?sourceLang=${language_1}&targetLang=${language_2}`,
      //     word,
      //     {
      //       headers: {
      //         "Content-Type": "text/plain;charset=UTF-8",
      //       },
      //     }
      //   )
      // ).data,
      await googleTranslate({
        text: word,
        source_language: language_1,
        target_language: language_2,
      }),
    ]);

    if (google.status === "fulfilled") {
      return { google: google.value };
    } else {
      return null;
    }
  } catch (error) {
    console.error("machineTranslation error: ", error);
    return null;
  }
}

export async function getGrammarGlosbe({ word }: { word: string }) {
  // https://vi.glosbe.com/en/vi/straightforward/fragment/details?phraseIndex=0&translationIndex=-1
  try {
    const rawData = await (
      await axios.get(
        `${GLOSBE_URL}/en/vi/${word}/fragment/details?phraseIndex=0&translationIndex=-1`
      )
    ).data;

    const document = parse(rawData);

    const grammars = document
      .querySelectorAll("#grammar_0_-1 > ul > li")
      .map((li) => {
        return li?.textContent;
      });

    return grammars;
  } catch (error) {
    console.log("getGrammarGlosbe error: ", error);
    return null;
  }
}
