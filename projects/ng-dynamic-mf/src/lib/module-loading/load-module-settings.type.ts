type OptionalSettings = {
  modulePath: string;
  environmentPath: string;
  /**
   * Describes how the environment variables should be resolved.
   * - `none`: No environment variables are loaded.
   * - `loadAndReuse` *(default)*: The environment variables are loaded and reused from existing loaded environments.
   * - `load`: The environment variables are loaded, but none are reused.
   * - `reuse`: The environment variables are reused from existing loaded environments but not loaded.
   */
  loadEnvironment: 'none' | 'loadAndReuse' | 'load' | 'reuse';
};
type RequiredSettings =
  | {
      type: 'host';
    }
  | {
      type: 'remote';
    };

export type AppStartupSettings = Partial<OptionalSettings> & RequiredSettings;
export type AppStartupSettingsInternal = OptionalSettings & RequiredSettings;
