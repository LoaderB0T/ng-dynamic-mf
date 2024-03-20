export type LoadRemoteModule = (options: {
  exposedModule: string;
  remoteEntry: string;
}) => Promise<any>;
