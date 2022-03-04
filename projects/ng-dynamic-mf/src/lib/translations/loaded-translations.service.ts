import { Injectable, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { resourceMapper } from '../resource-map';
import { TranslationSet, TranslationType } from './translations.type';

@Injectable({
  providedIn: 'root'
})
export class DynamicTranslationService {
  private readonly _translateService: TranslateService | null;

  constructor(@Optional() translateService: TranslateService | null) {
    this._translateService = translateService;
  }

  private readonly _loadedTranslations = new BehaviorSubject<TranslationSet>({});
  public readonly loadedTranslations$ = this._loadedTranslations.asObservable();

  public async registerTranslations(locales: string[], resolver: (locale: string) => string): Promise<void> {
    if (!this._translateService) {
      throw new Error(
        'DynamicTranslationService: TranslateService not found. Make sure you have @ngx-translate/core installed and imported in your app'
      );
    }
    const result: { locale: string; translations: TranslationType }[] = [];
    const promise = locales.map(async locale => {
      const resourceUrl = resourceMapper('core', resolver(locale));
      const response = await fetch(resourceUrl);
      const json = (await response.json()) as TranslationType;
      return result.push({ translations: json, locale });
    });
    await Promise.all(promise);
    result.forEach(({ locale, translations }) => {
      this._translateService!.setTranslation(locale, translations, true);
    });
  }
}
