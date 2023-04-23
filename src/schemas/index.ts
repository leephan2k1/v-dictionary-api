import { z } from "zod";

export const TranslationHistorySchema = z.object({
  body: z.object({
    word: z.string({
      required_error: "word is required",
    }),
    sense: z.string({
      required_error: "sense is required",
    }),
    targetLanguage: z.string({
      required_error: "targetLanguage is required",
    }),
    currentLanguage: z.string({
      required_error: "currentLanguage is required",
    }),
  }),
});

export const DeleteTranslationHistorySchema = z.object({
  body: z.object({
    word: z.string({
      required_error: "word is required",
    }),
    deleteOption: z.string().optional(),
  }),
});
