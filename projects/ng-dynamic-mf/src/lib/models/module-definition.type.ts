/**
 * Defines a module that should be loaded from the host application.
 */
export type ModuleDefinition = {
  /**
   * The name of the module to be loaded.
   * This name will be also used to resolve paths to assets.
   */
  name: string;
  /**
   * The internal project name of the module to be loaded.
   * This is only required for some commands of nx-dynamic-mf and does not affect the runtime.
   * Defaults to the value of `name`.
   */
  projectName?: string;
  /**
   * The name of the Angular module to be loaded. This module will be loaded on startup of the host.
   * The module must be exported in the remote entry file.
   * In this module, you might want to register routes using the RouterEntryService and probably register a menu item using your menu service.
   */
  ngModuleName: string;
  /**
   * The URL where to look for the remote entry file.
   * Can be relative to the host application or absolute.
   * @example 'http://localhost:4201'
   * @example 'https://my-cdn.com/'
   * @example './assets/modules/my-module'
   */
  url: string;
  /**
   * The hash of the remote entry file. You can calculate the hash yourself or use the "hash" command of nx-dynamic-mf.
   */
  hash?: string;
  /**
   * If set to true, the global styles of the module will be loaded. make sure to export the styles as described in the projects readme.
   */
  hasGlobalStyles?: boolean;
  /**
   * If your filename is not "global-styles.css" you can specify the name of the bundle here.
   * If the file gets a hashed suffix by Angular, you can use nx-dynamic-mf to adjust this property with the "construct" command.
   */
  globalStyleBundleName?: string;
};
