import { z } from "zod";

export const TranslationHistorySchema = z.object({
  body: z.object({
    translations_history: z
      .array(
        z.object({
          word: z.string(),
          sense: z.string(),
          targetLanguage: z.string(),
          currentLanguage: z.string(),
        })
      )
      .optional(),
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

export const FavoriteBodySchema = z.object({
  body: z.object({
    word: z.string({ required_error: "word is required" }),
    tag: z.string().optional(),
    numberOfDaysToForget: z.number().optional(),
  }),
});

export const FavoriteQuerySchema = z.object({
  query: z.object({
    word: z.string({ required_error: "word is required" }),
  }),
});

export const DashboardQuerySchema = z.object({
  query: z.object({
    status: z.string({ required_error: "status is required" }),
  }),
});

export const WordPreviewQuerySchema = z.object({
  query: z.object({
    status: z.string({ required_error: "status is required" }),
  }),
});

export const PracticeQuerySchema = z.object({
  query: z.object({
    status: z.string({ required_error: "status is required" }),
    tags: z.string({ required_error: "tags is required" }),
  }),
});

export const PracticePatchSchema = z.object({
  body: z.object({
    wordContent: z.string({ required_error: "wordContent is required" }),
    status: z.string({ required_error: "status is required" }),
  }),
});
