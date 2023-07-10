import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

interface LangChangeEvent {
  lang: string;
  translations: any;
}
export interface TranslateService {
  setTranslation(lang: string, translations: Object, shouldMerge?: boolean | undefined): void;
  get onLangChange(): EventEmitter<LangChangeEvent>;
  currentLang: string;
  defaultLang: string;
  use(lang: string): Observable<any>;
}
