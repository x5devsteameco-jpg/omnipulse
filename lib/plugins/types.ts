export interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  hooks?: PluginHooks;
}

export interface PluginHooks {
  beforeScrape?: (context: unknown) => unknown | Promise<unknown>;
  afterScrape?: (context: unknown) => unknown | Promise<unknown>;
  onMetricsCollected?: (metrics: unknown) => unknown | Promise<unknown>;
  onTrendDetected?: (trend: unknown) => unknown | Promise<unknown>;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
}

export type PluginHookType = keyof PluginHooks;
