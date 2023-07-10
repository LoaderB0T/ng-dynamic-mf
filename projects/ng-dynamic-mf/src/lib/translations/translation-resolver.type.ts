import { TranslationType } from './translations.type';

/**
 * An asset resolver is a function that returns the path to a translation file.
 * Internally, the path is resolved using this library's resouceMapper logic, so it can work with module federation.
 */
export type AssetResolver = {
  moduleName: string;
  resovler: (locale: string) => string;
};

export function isAssetResolver(resolver: TranslationResolver): resolver is AssetResolver {
  return (resolver as AssetResolver).moduleName !== undefined;
}

/**
 * A translation resolver can be a translation object, a function that returns a translation object,
 * a promise that resolves to a translation object, a function that returns a promise that resolves to a translation object,
 * or an asset resolver.
 */
export type TranslationResolver =
  | TranslationType
  | (() => TranslationType)
  | Promise<TranslationType>
  | (() => Promise<TranslationType>)
  | AssetResolver;

export type TranslationResolverMultiLocale = { [locale: string]: TranslationResolver };

export type TranslationResolverSet = {
  [key: string]: TranslationResolverMultiLocale;
};
