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
export const initializeEnvironment = (env: Environment) => {
  if (!env.production) {
    (window as any).__gah__env = env;
  }
  Object.keys(env).forEach(key => {
    environment[key] = env[key];
  });
};
