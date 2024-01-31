export type Environment = {
  production: boolean;
  [key: string]: any;
};

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

// @internal
export const initializeEnvironment = (env: Environment, disableParentEnvironmentReuse?: boolean) => {
  if (disableParentEnvironmentReuse || !reuseEnvironment()) {
    (window as any).__ng_dynamic_mf_env__ = env;
  }
  Object.keys(env).forEach(key => {
    environment[key] = env[key];
  });
};

// @internal
export const reuseEnvironment = () => {
  const existingEnv = (window as any).__ng_dynamic_mf_env__;
  if (!existingEnv) {
    return false;
  }
  Object.keys(existingEnv).forEach(key => {
    environment[key] = existingEnv[key];
  });
  return true;
};

/**
 * Copies all environment variables into an iframe
 * Make sure to call this mehtod before the angular app in the iframe is bootstrapped
 * @param iframe the iframe to copy the environment into
 */
export function copyEnvironmentIntoIFrame(iframe: HTMLIFrameElement) {
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
};
