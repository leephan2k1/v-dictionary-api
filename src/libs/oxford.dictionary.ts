import { OXFORD_DICTIONARY_URL } from "../configs";
import type { Language } from "../types";
import axios from "axios";
import { parse } from "node-html-parser";

export async function getAudioOxford({ word }: { word: string }) {
  let phonetics;

  try {
    const raw_phonetics = await (
      await axios.get(`${OXFORD_DICTIONARY_URL}/definition/english/${word}`)
    ).data;

    const document = parse(raw_phonetics);

    phonetics = document
      .querySelectorAll(".phonetics > div")
      ?.map((div, idx) => {
        return {
          phrase: div.querySelector(".phon")?.textContent,
          author: `OxfordDictionary_${idx === 0 ? "English" : "American"}`,
          url: div.querySelector(".sound")?.getAttribute("data-src-mp3"),
        };
      });

    return phonetics;
  } catch (error) {
    console.error("get audio oxford error: ", error);
  }

  return phonetics;
}

export async function translateOxford({ word }: { word: string }) {
  try {
    const rawData = await (
      await axios.get(`${OXFORD_DICTIONARY_URL}/definition/english/${word}`)
    ).data;

    const document = parse(rawData);

    const wordContent = document.querySelector(`#${word}_h_1`)?.textContent;

    if (!wordContent) throw new Error();

    const typesOfWord = document.querySelector(`span.pos`)?.textContent;

    const senses = document.querySelectorAll("span.def").map((span, index) => {
      const examples = document
        .querySelectorAll(`#${word}_sng_${index + 1} > ul > li`)
        .map((li) => li?.textContent);

      return { sense: span?.textContent, typeOfWord: typesOfWord, examples };
    });

    return {
      wordContent,
      typesOfWord: [typesOfWord],
      senses,
    };
  } catch (error) {
    console.log("translateOxford error: ", error);
    return null;
  }
}
