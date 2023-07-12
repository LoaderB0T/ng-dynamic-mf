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
  const existingEnv = (window as any).__ng_dynamic_mf_env__;

  if (existingEnv && !disableParentEnvironmentReuse) {
    Object.keys(existingEnv).forEach(key => {
      environment[key] = env[key];
    });
  } else {
    (window as any).__ng_dynamic_mf_env__ = env;
  }
  Object.keys(env).forEach(key => {
    environment[key] = env[key];
  });
};

/**
 * Use this to set a custom environment variable at runtime
 * @param key the key of the environment variable
 * @param value the value of the environment variable
 */
export const setEnvironmentValue = (key: string, value: any) => {
  environment[key] = value;
};
