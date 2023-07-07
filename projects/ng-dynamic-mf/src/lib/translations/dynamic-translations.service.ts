import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { resourceMapper } from '../resource-map';
import { TranslateService } from './service.type';
import {
  isAssetResolver,
  TranslationResolver,
  TranslationResolverMultiLocale,
  TranslationResolverSet
} from './translation-resolver.type';
import { TranslationType } from './translations.type';

type TranslationResolverState = {
  resolver: TranslationResolver;
  key: string;
  loadedTranslations: TranslationType | null;
};

type TranslationStore = {
  [locale: string]: TranslationResolverState[];
};

@Injectable({
  providedIn: 'root'
})
export class DynamicTranslationService {
  private _translateService: TranslateService | null = null;
  private readonly _translationsInvalidated = new BehaviorSubject<void>(undefined);
  private readonly _translationStore: TranslationStore = {};
  private _locale?: string;

  public setTranslateService(translateService: TranslateService): void {
    if (this._translateService) {
      return;
    }
    this._translateService = translateService;
    this._locale = translateService.currentLang || translateService.defaultLang || 'en';
    translateService.onLangChange.subscribe(e => {
      this._locale = e.lang;
      this.invalidateTranslations();
    });

    this._translationsInvalidated.subscribe(() => {
      this.loadTranslations();
    });
  }

  public registerTranslation(translationSetIdentifier: string, locale: string, translationResolver: TranslationResolver) {
    this.registerSingleTranslation(translationSetIdentifier, locale, translationResolver);
    this.invalidateTranslations();
  }

  public registerTranslations(translationSetIdentifier: string, translationResolvers: TranslationResolverMultiLocale) {
    this.doRegisterTranslations(translationSetIdentifier, translationResolvers);
    this.invalidateTranslations();
  }

  private doRegisterTranslations(translationSetIdentifier: string, translationResolvers: TranslationResolverMultiLocale) {
    Object.keys(translationResolvers).forEach(locale => {
      this.registerSingleTranslation(translationSetIdentifier, locale, translationResolvers[locale]);
    });
  }

  public registerTranslationSet(set: TranslationResolverSet) {
    Object.keys(set).forEach(translationSetKey => {
      this.doRegisterTranslations(translationSetKey, set[translationSetKey]);
    });
    this.invalidateTranslations();
  }

  private registerSingleTranslation(translationSetIdentifier: string, locale: string, translationResolver: TranslationResolver) {
    if (!this._translateService) {
      throw new Error(
        'DynamicTranslationService: TranslateService not found. Make sure you have @ngx-translate/core installed and called setTranslateService()'
      );
    }
    const translationResolvers = this._translationStore[locale] || [];
    const existing = translationResolvers.find(r => r.key === translationSetIdentifier);

    if (existing) {
      existing.resolver = translationResolver;
      existing.loadedTranslations = null;
    } else {
      translationResolvers.push({ resolver: translationResolver, key: translationSetIdentifier, loadedTranslations: null });
      this._translationStore[locale] ??= translationResolvers;
    }
  }

  public removeTranslation(translationSetIdentifier: string, locale?: string) {
    if (!locale) {
      Object.keys(this._translationStore).forEach(locale => {
        this.doRemoveTranslation(translationSetIdentifier, locale);
      });
    } else {
      this.doRemoveTranslation(translationSetIdentifier, locale);
    }
    this.invalidateTranslations();
  }

  private doRemoveTranslation(translationSetIdentifier: string, locale: string) {
    const translationResolvers = this._translationStore[locale] ?? [];
    const index = translationResolvers.findIndex(r => r.key === translationSetIdentifier);
    if (index !== -1) {
      translationResolvers.splice(index, 1);
    }
  }

  private invalidateTranslations() {
    this._translationsInvalidated.next();
  }

  private async loadTranslations() {
    if (!this._translateService) {
      throw new Error(
        'DynamicTranslationService: TranslateService not found. Make sure you have @ngx-translate/core installed and called setTranslateService()'
      );
    }
    const locale = this._locale;
    if (!locale) {
      return;
    }
    const translationResolvers = this._translationStore[locale] ?? [];
    await this.resolveTranslations(translationResolvers);
    const loadedTranslations = this.mergeLoadedTranslations(translationResolvers);
    this._translateService.setTranslation(locale, loadedTranslations, false);
    if (this._locale) {
      this._translateService.use(this._locale);
    }
  }

  private async resolveTranslations(translationResolvers: TranslationResolverState[]) {
    const promises = translationResolvers.map(async translationResolver => {
      if (translationResolver.loadedTranslations) {
        return;
      }
      const loadedTranslations = await this.resolveTranslation(translationResolver.resolver);
      translationResolver.loadedTranslations = loadedTranslations;
    });
    await Promise.all(promises);
  }

  private mergeLoadedTranslations(translationResolvers: TranslationResolverState[]): TranslationType {
    const translations: TranslationType = {};
    translationResolvers.forEach(translationResolver => {
      if (!translationResolver.loadedTranslations) {
        return;
      }
      Object.assign(translations, translationResolver.loadedTranslations);
    });
    return translations;
  }

  private async resolveTranslation(translationResolver: TranslationResolver): Promise<TranslationType> {
    let promiseResolver: Promise<TranslationType>;
    // check if translationResolver is a promise
    if (translationResolver instanceof Promise) {
      promiseResolver = translationResolver;
    } else if (typeof translationResolver === 'function') {
      const fnResult = translationResolver();
      if (fnResult instanceof Promise) {
        promiseResolver = fnResult;
      } else {
        promiseResolver = Promise.resolve(fnResult);
      }
    } else if (isAssetResolver(translationResolver)) {
      promiseResolver = this.loadLocaleFromAssetPath(translationResolver.moduleName, translationResolver.resovler, this._locale!);
    } else {
      promiseResolver = Promise.resolve(translationResolver);
    }
    const loadedTranslations = await promiseResolver;
    return loadedTranslations;
  }

  private async loadLocaleFromAssetPath(
    moduleName: string,
    resolver: (locale: string) => string,
    locale: string
  ): Promise<TranslationType> {
    const resourceUrl = resourceMapper(moduleName, resolver(locale));

    const response = await fetch(resourceUrl);
    const content = (await response.json()) as TranslationType;
    return content;
  }
}
