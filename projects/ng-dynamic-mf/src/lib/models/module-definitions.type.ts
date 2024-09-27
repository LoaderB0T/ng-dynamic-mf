import { ModuleDefinition } from './module-definition.type';

export type ModuleDefinitions = {
  /**
   * The schema of the module definition. Should be 'https://raw.githubusercontent.com/LoaderB0T/ng-dynamic-mf/refs/heads/main/schema.json' or similar.
   */
  $schema?: string;
  /**
   * The modules that should be loaded from the host application.
   */
  modules: ModuleDefinition[];
};
