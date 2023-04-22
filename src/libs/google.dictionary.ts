import axios from "axios";
import { translate } from "@vitalets/google-translate-api";

export async function googleTranslate({
  text,
  target_language,
  source_language,
}: {
  text: string;
  target_language: string;
  source_language: string;
}) {
  try {
    const { text: textTranslated } = await translate(text, {
      to: target_language,
    });

    return textTranslated;
  } catch (error) {
    try {
      //fallback rate limit:
      console.log("-- RATE LIMIT AND CALL RAPID API HOST FALLBACK --");
      const encodedParams = new URLSearchParams();
      encodedParams.append("source_language", source_language);
      encodedParams.append("target_language", target_language);
      encodedParams.append("text", text);

      const options = {
        method: "POST",
        url: `${process.env.TRANSLATE_URL}`,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Key": `${process.env.RAPID_API_KEY}`,
          "X-RapidAPI-Host": `${process.env.RAPID_API_HOST}`,
        },
        data: encodedParams,
      };

      const { data } = await axios.request(options);

      return await data.data.translatedText;
    } catch (error) {
      console.error("GOOGLE TRANSLATE ERROR: ", error);
    }
  }
}
