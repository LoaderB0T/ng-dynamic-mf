export type Environment = {
  production: boolean;
  [key: string]: any;
};
let environmentUpdateCallback: ((environment: Environment) => void) | null = null;

/**
 * import this for all values of the environment.json file
 */
export const environment: Environment = { production: false };

export const envValidator = (defaultEnvironment: Environment) => {
  if (!environment) {
    console.error('Environment is not defined');
  }
  (Object.keys(defaultEnvironment) as (keyof typeof defaultEnvironment)[]).forEach(key => {
    if (!environment[key]) {
      console.error(`Environment is missing '${key}'`);
    }
  });
};

export const ɵinitializeEnvironment = (
  env: Environment,
  disableParentEnvironmentReuse?: boolean
) => {
  if (disableParentEnvironmentReuse || !ɵreuseEnvironment()) {
    (window as any).__ng_dynamic_mf_env__ = env;
  }
  Object.keys(env).forEach(key => {
    environment[key] = env[key];
  });
  environmentUpdateCallback?.(environment);
};

export const ɵreuseEnvironment = () => {
  const existingEnv = (window as any).__ng_dynamic_mf_env__;
  if (!existingEnv) {
    return false;
  }
  Object.keys(existingEnv).forEach(key => {
    environment[key] = existingEnv[key];
  });
  environmentUpdateCallback?.(environment);
  return true;
};

/**
 * Use this to check if the ng-dynamic-mf environment is available.
 * Will be false if ng-dynamic-mf was not used to bootstrap the app and no environment was set manually
 */
export function hasEnvironment() {
  return !!(window as any).__ng_dynamic_mf_env__;
}

/**
 * Copies all environment variables into an iframe
 * Make sure to call this mehtod before the angular app in the iframe is bootstrapped
 * @param iframe the iframe to copy the environment into
 * @throws if the environment is not available. Check with `hasEnvironment()` before calling this method
 */
export function copyEnvironmentIntoIFrame(iframe: HTMLIFrameElement) {
  if (!hasEnvironment()) {
    throw new Error('ng-dynamic-mf environment is not available.');
  }
  const env = (window as any).__ng_dynamic_mf_env__;
  if (env) {
    (iframe.contentWindow as any).__ng_dynamic_mf_env__ = env;
  } else {
    console.error('Environment (__ng_dynamic_mf_env__) is not defined');
  }
}

/**
 * Use this to set a custom environment variable at runtime
 * @param key the key of the environment variable
 * @param value the value of the environment variable
 */
export const setEnvironmentValue = (key: string, value: any) => {
  environment[key] = value;
  environmentUpdateCallback?.(environment);
};

/**
 * Registers a callback that is called whenever the environment is updated
 * @param callback the callback that is called whenever the environment is updated
 */
export const registerEnvironmentUpdateCallback = (callback: (environment: Environment) => void) => {
  environmentUpdateCallback = callback;
};
