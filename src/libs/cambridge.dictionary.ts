import { CAMBRIDGE_DICTIONARY_URL } from "../configs";
import { parse } from "node-html-parser";
import axios from "axios";
import { normalizeString } from "../utils/string";

export async function getAudioCambridge({ word }: { word: string }) {
  let raw_phonetics;
  let phonetics;

  try {
    raw_phonetics = await (
      await axios.get(
        `${CAMBRIDGE_DICTIONARY_URL}/vi/dictionary/english/${word}`
      )
    ).data;

    const document = parse(raw_phonetics);

    console.log("document: ", document);

    const uk_audio =
      String(CAMBRIDGE_DICTIONARY_URL) +
      document.querySelector("#audio1 source")?.getAttribute("src");
    const uk_phonetic = document.querySelector(
      "#page-content > div.page > div:nth-child(1) > div.link > div > div.di-body > div > div > div:nth-child(1) > div.pos-header.dpos-h > span.uk.dpron-i > span.pron.dpron"
    )?.textContent;

    const us_audio =
      String(CAMBRIDGE_DICTIONARY_URL) +
      document.querySelector("#audio2 source")?.getAttribute("src");
    const us_phonetic = document.querySelector(
      "#page-content > div.page > div:nth-child(1) > div.link > div > div.di-body > div > div > div:nth-child(1) > div.pos-header.dpos-h > span.us.dpron-i > span.pron.dpron"
    )?.textContent;

    phonetics = [
      { phrase: uk_phonetic, author: "Cambridge_English", url: uk_audio },
      { phrase: us_phonetic, author: "Cambridge_American", url: us_audio },
    ];
  } catch (error) {
    console.error("get audio cambridge error: ", error);
  }

  return phonetics;
}

export async function translateCambridge({ word }: { word: string }) {
  try {
    const rawData = await (
      await axios.get(
        `${CAMBRIDGE_DICTIONARY_URL}/vi/dictionary/english/${word}`
      )
    ).data;

    const document = parse(rawData);

    const wordContent = document.querySelector(
      "#page-content > div.page > div:nth-child(1) > div.link > div > div.di-body > div > div > div:nth-child(1) > div.pos-header.dpos-h > div.di-title > span > span"
    )?.textContent;

    if (!wordContent) throw new Error();

    const typesOfWord = document
      .querySelectorAll(".pr.entry-body__el .pos.dpos")
      .map((span) => span?.textContent);

    const senses = document
      .querySelectorAll(".pr.entry-body__el")
      .map((container) => {
        const typeOfWord = container.querySelector(".pos.dpos")?.textContent;
        const sense = container.querySelector(".def.ddef_d.db")?.textContent;
        const examples = container
          .querySelectorAll(".examp.dexamp")
          .map((div) => {
            return normalizeString(String(div?.textContent));
          });

        return { typeOfWord, sense, examples };
      });

    return { wordContent, typesOfWord: [...new Set(typesOfWord)], senses };
  } catch (error) {
    console.log("translateCambridge error ", error);
    return null;
  }
}
