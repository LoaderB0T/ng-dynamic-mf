export type ModuleTranslationSet = {
  [module: string]: TranslationSet;
};

export type TranslationSet = {
  [locale: string]: TranslationType;
};

export type TranslationType = {
  [key: string]: string | TranslationType;
};
