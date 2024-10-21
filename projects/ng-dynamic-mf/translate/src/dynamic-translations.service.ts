import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  startWith,
} from 'rxjs';
import {
  isAssetResolver,
  TranslationResolver,
  TranslationResolverMultiLocale,
  TranslationResolverSet,
} from './translation-resolver.type';
import { TranslationType } from './translations.type';
import { resourceMapper } from 'ng-dynamic-mf';
import { TranslateService } from '@ngx-translate/core';

type TranslationResolverState = {
  resolver: TranslationResolver;
  key: string;
  loadedTranslations: TranslationType | null;
};

type TranslationStore = {
  [locale: string]: TranslationResolverState[];
};

/**
 * This service is used to dynamically load translations from different modules.
 * It uses @ngx-translate/core internally, so make sure you have it installed and
 * the TranslateModule is imported correctly.
 */
@Injectable({
  providedIn: 'root',
})
export class DynamicTranslationService {
  private readonly _translateService = inject(TranslateService);
  private readonly _translationsInvalidated = new BehaviorSubject<void>(undefined);
  private readonly _translationsUpdated = new BehaviorSubject<void>(undefined);
  private readonly _translationStore: TranslationStore = {};
  private _locale =
    this._translateService.currentLang || this._translateService.defaultLang || 'en';
  private _debugMode = false;

  constructor() {
    this._translateService.onLangChange.subscribe(e => {
      this._locale = e.lang;
      this.invalidateTranslations();
    });

    this._translationsInvalidated.subscribe(() => {
      this.loadTranslations();
    });
  }

  /**
   * Sets the debug mode. In debug mode, the translation values are replaced with their keys.
   * @param debugMode Whether to enable debug mode
   */
  public setDebugMode(debugMode: boolean) {
    this._debugMode = debugMode;
    this.invalidateTranslations();
  }

  /**
   * Registers a resolver for translations for a specific locale.
   * @param translationSetIdentifier The identifier of the translations (e.g. the name of the module)
   * @param locale The locale of the translations
   * @param translationResolver The resolver for the translations
   */
  public registerTranslationSetForLocale(
    translationSetIdentifier: string,
    locale: string,
    translationResolver: TranslationResolver
  ) {
    this.registerSingleTranslation(translationSetIdentifier, locale, translationResolver);
    this.invalidateTranslations();
  }

  /**
   * Registers resolvers for translations for multiple locales.
   * @param translationSetIdentifier The identifier of the translations (e.g. the name of the module)
   * @param translationResolvers The resolvers for the translations
   */
  public registerTranslationSet(
    translationSetIdentifier: string,
    translationResolvers: TranslationResolverMultiLocale
  ) {
    this.doRegisterTranslationSet(translationSetIdentifier, translationResolvers);
    this.invalidateTranslations();
  }

  /**
   * Registers multiple translation resolvers for multiple locales.
   * @param set The set of resolvers for the translations
   */
  public registerMultipleTranslationSets(set: TranslationResolverSet) {
    Object.keys(set).forEach(translationSetKey => {
      this.doRegisterTranslationSet(translationSetKey, set[translationSetKey]);
    });
    this.invalidateTranslations();
  }

  private doRegisterTranslationSet(
    translationSetIdentifier: string,
    translationResolvers: TranslationResolverMultiLocale
  ) {
    Object.keys(translationResolvers).forEach(locale => {
      this.registerSingleTranslation(
        translationSetIdentifier,
        locale,
        translationResolvers[locale]
      );
    });
  }

  private registerSingleTranslation(
    translationSetIdentifier: string,
    locale: string,
    translationResolver: TranslationResolver
  ) {
    const translationResolvers = this._translationStore[locale] || [];
    const existing = translationResolvers.find(r => r.key === translationSetIdentifier);

    if (existing) {
      existing.resolver = translationResolver;
      existing.loadedTranslations = null;
    } else {
      translationResolvers.push({
        resolver: translationResolver,
        key: translationSetIdentifier,
        loadedTranslations: null,
      });
      this._translationStore[locale] ??= translationResolvers;
    }
  }

  /**
   * Removes a translation set for a specific locale.
   * @param translationSetIdentifier The identifier of the translations (e.g. the name of the module)
   * @param locale The locale of the translations. If not specified, the translations will be removed for all locales.
   */
  public removeTranslation(translationSetIdentifier: string, locale?: string) {
    if (!locale) {
      Object.keys(this._translationStore).forEach(l => {
        this.doRemoveTranslation(translationSetIdentifier, l);
      });
    } else {
      this.doRemoveTranslation(translationSetIdentifier, locale);
    }
    this.invalidateTranslations();
  }

  /**
   * Asynchronously checks if a translation set is loaded for the current locale.
   * @param translationSetIdentifier The identifier of the translations (e.g. the name of the module)
   * @returns Observable that emits true if the translation set is loaded, false otherwise
   */
  public isTranslationSetLoaded(translationSetIdentifier: string): Observable<boolean> {
    return combineLatest([
      this._translateService.onLangChange.pipe(startWith(undefined)),
      this._translationsUpdated,
    ]).pipe(
      map(() => this.isTranslationSetLoadedSync(translationSetIdentifier)),
      distinctUntilChanged()
    );
  }

  /**
   * Resolves if a translation set is loaded for the current locale.
   * @param translationSetIdentifier The identifier of the translations (e.g. the name of the module)
   * @returns Promise that resolves if the translation set is loaded, never rejects (use isTranslationSetLoaded() to check if the translation set is loaded)
   */
  public async ensureTranslationSetIsLoaded(translationSetIdentifier: string): Promise<void> {
    await firstValueFrom(
      this.isTranslationSetLoaded(translationSetIdentifier).pipe(filter(loaded => loaded))
    );
  }

  /**
   * Checks if a translation set is loaded for the current locale.
   * @param translationSetIdentifier The identifier of the translations (e.g. the name of the module)
   * @returns true if the translation set is loaded, false otherwise
   */
  public isTranslationSetLoadedSync(translationSetIdentifier: string): boolean {
    if (!this._locale) {
      return false;
    }
    const set = this._translationStore[this._locale!];
    if (!set) {
      return false;
    }
    return set.some(r => r.key === translationSetIdentifier && !!r.loadedTranslations);
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
    const locale = this._locale;
    if (!locale) {
      return;
    }
    const translationResolvers = this._translationStore[locale] ?? [];
    await this.resolveTranslations(translationResolvers);
    const loadedTranslations = this.mergeLoadedTranslations(translationResolvers);
    this._translateService.setTranslation(locale, loadedTranslations, true);
    if (this._locale) {
      this._translateService.use(this._locale);
    }
    this._translationsUpdated.next();
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

  private mergeLoadedTranslations(
    translationResolvers: TranslationResolverState[]
  ): TranslationType {
    const translations: TranslationType = {};
    translationResolvers.forEach(translationResolver => {
      if (!translationResolver.loadedTranslations) {
        return;
      }
      if (this._debugMode) {
        const debugTranslations = this.putTranslationsIntoDebugMode(
          translationResolver.loadedTranslations
        );
        Object.assign(translations, debugTranslations);
      } else {
        Object.assign(translations, translationResolver.loadedTranslations);
      }
    });
    return translations;
  }

  private async resolveTranslation(
    translationResolver: TranslationResolver
  ): Promise<TranslationType> {
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
      promiseResolver = this.loadLocaleFromAssetPath(
        translationResolver.moduleName,
        translationResolver.path
      );
    } else {
      promiseResolver = Promise.resolve(translationResolver);
    }
    const loadedTranslations = await promiseResolver;
    return loadedTranslations;
  }

  private async loadLocaleFromAssetPath(
    moduleName: string,
    path: string
  ): Promise<TranslationType> {
    const resourceUrl = resourceMapper(moduleName, path);

    const response = await fetch(resourceUrl);
    const content = (await response.json()) as TranslationType;
    return content;
  }

  private putTranslationsIntoDebugMode(
    translations: TranslationType,
    prefix = ''
  ): TranslationType {
    const debugTranslations: TranslationType = {};
    Object.keys(translations).forEach(key => {
      const value = translations[key];
      if (typeof value === 'string') {
        debugTranslations[key] = prefix + key;
      } else {
        debugTranslations[key] = this.putTranslationsIntoDebugMode(value, prefix + key + '.');
      }
    });
    return debugTranslations;
  }
}
