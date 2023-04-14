export interface ErrorType {
  status: number;
  message: string;
}

export type Source = "glosbe" | "oxford" | "cambridge";

export type LanguagePairs = "vi-en" | "en-vi" | "en-en";

export type Language = "en" | "vi";
