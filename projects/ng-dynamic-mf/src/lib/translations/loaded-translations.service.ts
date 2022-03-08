import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { resourceMapper } from '../resource-map';
import { TranslateService } from './service.type';
import { TranslationSet, TranslationType } from './translations.type';

@Injectable({
  providedIn: 'root'
})
export class DynamicTranslationService {
  private _translateService: TranslateService | null = null;

  constructor() {}

  public setTranslateService(translateService: TranslateService): void {
    this._translateService = translateService;
  }

  private readonly _loadedTranslations = new BehaviorSubject<TranslationSet>({});
  public readonly loadedTranslations$ = this._loadedTranslations.asObservable();

  public async registerTranslations(locales: string[], resolver: (locale: string) => string, moduleName: string): Promise<void> {
    if (!this._translateService) {
      throw new Error(
        'DynamicTranslationService: TranslateService not found. Make sure you have @ngx-translate/core installed and called setTranslateService()'
      );
    }
    const result: { locale: string; translations: TranslationType }[] = [];
    const promise = locales.map(async locale => {
      const resourceUrl = resourceMapper(moduleName, resolver(locale));
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
