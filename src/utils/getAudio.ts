import { getAudioGlosbe, getAudioOxford, getAudioCambridge } from "../libs";
import type { Source } from "../types";

export async function getAudioInfo({
  word,
  format,
  source,
}: {
  word: string;
  format: "en" | "vi";
  source: Source;
}) {
  switch (source) {
    case "glosbe":
      return await getAudioGlosbe({ format, word });
    case "oxford":
      return await getAudioOxford({ word });
    case "cambridge":
      return await getAudioCambridge({ word });
  }
}
