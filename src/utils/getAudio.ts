import axios from "axios";
import { GLOSBE_URL, OXFORD_DICTIONARY_URL } from "../configs";
import type { Source } from "../types";
import { parse } from "node-html-parser";

export async function getAudioInfo({
  word,
  format,
  source,
}: {
  word: string;
  format: "en" | "vi";
  source: Source;
}) {
  let raw_phonetics;
  let phonetics;

  try {
    if (source === "glosbe") {
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

      return phonetics;
    }

    if (source === "oxford") {
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
    }
  } catch (error) {
    console.log("get audio error: ", error);
  }
}
