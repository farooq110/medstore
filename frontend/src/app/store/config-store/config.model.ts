/**
 * Config Store Model
 * Defines interfaces for app configuration including version info
 */

export interface AppConfig {
  version: string;
}

export interface ConfigStateModel {
  appVersion: AppConfig | null;
  loading: boolean;
  error: string | null;
  localVersion: string | null;
  versionMismatch: boolean;
  mismatchType: 'outdated' | 'newer' | null;
  versionCheckDone: boolean;
}
