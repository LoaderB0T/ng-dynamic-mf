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

  /**
   * Register translations for a module.
   *
   * This method will load the translations for the given locales and merge them with any other translations that have already been loaded.
   *
   * @param translations The translations to load by locale. Example:
   * ```typescript
   * { en: import('assets/i18n/en.ts'), de: import('assets/i18n/de.ts') }
   * ```
   * @param moduleName The name of the module to load translations for
   */
  public async registerTranslationsFromModule(
    translations: { [locale: string]: Promise<any> },
    moduleName: string
  ): Promise<void> {
    if (!this._translateService) {
      throw new Error(
        'DynamicTranslationService: TranslateService not found. Make sure you have @ngx-translate/core installed and called setTranslateService()'
      );
    }
    const locales = Object.keys(translations);
    const promises = locales.map(async locale => {
      await this.loadLocaleFromImportPath(moduleName, translations[locale], locale);
    });
    await Promise.all(promises);
    const allTranslations: TranslationSet = this.mergeLoadedTranslations();
    this._knownLocales.forEach(locale => {
      const translations = allTranslations[locale];
      this._translateService!.setTranslation(locale, translations, true);
    });
  }

  /**
   * Register translations for a module.
   *
   * This method will load the translations for the given locales and merge them with any other translations that have already been loaded.
   *
   * @param locales The locales to load translations for (e.g. ['en', 'de'])
   * @param resolver A function that takes a locale and returns the path to the translation file for that locale (e.g. ``(locale) => `assets/i18n/${locale}.json` ``)
   * @param moduleName The name of the module to load translations for
   */
  public async registerTranslations(locales: string[], resolver: (locale: string) => string, moduleName: string): Promise<void> {
    if (!this._translateService) {
      throw new Error(
        'DynamicTranslationService: TranslateService not found. Make sure you have @ngx-translate/core installed and called setTranslateService()'
      );
    }
    const promises = locales.map(async locale => {
      await this.loadLocaleFromAssetPath(moduleName, resolver, locale);
    });
    await Promise.all(promises);
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

  private async loadLocaleFromAssetPath(moduleName: string, resolver: (locale: string) => string, locale: string) {
    const resourceUrl = resourceMapper(moduleName, resolver(locale));
    if (this._knownTranslations[moduleName]?.[locale]) {
      // Already loaded
      return;
    }
    this._knownResourceUrls.push(resourceUrl);
    const response = await fetch(resourceUrl);
    const loadedTranslation = (await response.json()) as TranslationType;
    this.saveResolvedTranslation(locale, moduleName, loadedTranslation);
  }

  private async loadLocaleFromImportPath(moduleName: string, translation: Promise<any>, locale: string) {
    if (this._knownTranslations[moduleName]?.[locale]) {
      // Already loaded
      return;
    }
    const loadedTranslation = (await translation) as TranslationType;
    this.saveResolvedTranslation(locale, moduleName, loadedTranslation);
  }

  private saveResolvedTranslation(locale: string, moduleName: string, loadedTranslation: TranslationType) {
    if (!this._knownLocales.some(l => l === locale)) {
      this._knownLocales.push(locale);
    }
    if (!this._knownTranslations[moduleName]) {
      this._knownModules.push(moduleName);
      this._knownTranslations[moduleName] = {};
    }
    this._knownTranslations[moduleName][locale] = loadedTranslation;
  }
}
