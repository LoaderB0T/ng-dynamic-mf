import { TranslationType } from './translations.type';

export type AssetResolver = {
  moduleName: string;
  resovler: (locale: string) => string;
};

export function isAssetResolver(resolver: TranslationResolver): resolver is AssetResolver {
  return (resolver as AssetResolver).moduleName !== undefined;
}

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
