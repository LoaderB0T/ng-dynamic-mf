export type Environment = {
  production: boolean;
  [key: string]: any;
};
let environmentUpdateCallback: ((environment: Environment) => void) | null = null;

let win: Window | null = null;
type Win = typeof window & { __ng_dynamic_mf_env__: Environment };

function getWindow() {
  return (win || window) as Win;
}

export function setWindow(window: Window) {
  win = window;
}

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
    getWindow().__ng_dynamic_mf_env__ = env;
  }
  Object.keys(env).forEach(key => {
    environment[key] = env[key];
  });
  environmentUpdateCallback?.(environment);
};

export const ɵreuseEnvironment = () => {
  const existingEnv = getWindow().__ng_dynamic_mf_env__;
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
  return !!getWindow().__ng_dynamic_mf_env__;
}

/**
 * Copies all environment variables into an iframe
 * Make sure to call this mehtod before the angular app in the iframe is bootstrapped
 * @param iframe the iframe to copy the environment into
 * @param environment optional environment to copy into the iframe. If not provided, the environment from the parent window is used
 *  * @throws if the environment is not available. Check with `hasEnvironment()` before calling this method
 */
export function copyEnvironmentIntoIFrame(iframe: HTMLIFrameElement, environment?: Environment) {
  if (!hasEnvironment() && !environment) {
    throw new Error('ng-dynamic-mf environment is not available and no environment was provided');
  }
  const env = environment ?? getWindow().__ng_dynamic_mf_env__;
  if (env) {
    (iframe.contentWindow as Win).__ng_dynamic_mf_env__ = env;
  } else {
    console.error('Environment (__ng_dynamic_mf_env__) is not defined');
  }
}

/**
 * Use this to set a custom environment variable at runtime
 * @param key the key of the environment variable
 * @param value the value of the environment variable
 */
export const setEnvironmentValue = (key: string, value: unknown) => {
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
