import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

interface LangChangeEvent {
  lang: string;
  translations: any;
}

/**
 * This interface is a subset of the @ngx-translate/core TranslateService.
 * It is used to make the library independent of @ngx-translate/core.
 */
export interface TranslateService {
  setTranslation(lang: string, translations: Object, shouldMerge?: boolean | undefined): void;
  get onLangChange(): EventEmitter<LangChangeEvent>;
  currentLang: string;
  defaultLang: string;
  use(lang: string): Observable<any>;
}
