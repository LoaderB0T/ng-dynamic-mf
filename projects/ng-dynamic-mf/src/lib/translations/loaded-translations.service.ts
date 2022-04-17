import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { resourceMapper } from '../resource-map';
import { TranslateService } from './service.type';
import { ModuleTranslationSet, TranslationSet, TranslationType } from './translations.type';

@Injectable({
  providedIn: 'root'
})
export class DynamicTranslationService {
  private _translateService: TranslateService | null = null;
  private readonly _knownTranslations: ModuleTranslationSet = {};
  private readonly _knownModules: string[] = [];
  private readonly _knownLocales: string[] = [];
  private readonly _knownResourceUrls: string[] = [];

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
    const promise = locales.map(async locale => {
      await this.loadLocaleForModule(moduleName, resolver, locale);
    });
    await Promise.all(promise);
    const allTranslations: TranslationSet = this.mergeLoadedTranslations();
    this._knownLocales.forEach(locale => {
      const translations = allTranslations[locale];
      this._translateService!.setTranslation(locale, translations, true);
    });
  }

  private mergeLoadedTranslations() {
    const allTranslations: TranslationSet = {};
    this._knownModules.forEach(moduleName => {
      const moduleTranslations = this._knownTranslations[moduleName];
      this._knownLocales.forEach(locale => {
        if (moduleTranslations[locale]) {
          allTranslations[locale] = {
            ...allTranslations[locale],
            ...moduleTranslations[locale]
          };
        }
      });
    });
    return allTranslations;
  }

  private async loadLocaleForModule(moduleName: string, resolver: (locale: string) => string, locale: string) {
    const resourceUrl = resourceMapper(moduleName, resolver(locale));
    if (this._knownResourceUrls.includes(resourceUrl)) {
      // Already loaded
      return;
    }
    this._knownResourceUrls.push(resourceUrl);
    const response = await fetch(resourceUrl);
    const json = (await response.json()) as TranslationType;
    if (!this._knownLocales.some(l => l === locale)) {
      this._knownLocales.push(locale);
    }
    if (!this._knownTranslations[moduleName]) {
      this._knownModules.push(moduleName);
      this._knownTranslations[moduleName] = {};
    }
    this._knownTranslations[moduleName][locale] = json;
  }
}
