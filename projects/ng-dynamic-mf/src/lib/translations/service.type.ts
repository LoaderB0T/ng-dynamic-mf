export interface TranslateService {
  setTranslation(lang: string, translations: Object, shouldMerge?: boolean | undefined): void;
}
