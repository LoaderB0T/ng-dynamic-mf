export type TranslationSet = {
  [locale: string]: TranslationType;
};

export type TranslationType = {
  [key: string]: string | TranslationType;
};
