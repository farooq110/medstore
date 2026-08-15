/**
 * Config Store Actions
 * Actions for fetching and managing app configuration
 */

import { AppConfig } from './config.model';
import { ActionOptions } from '../api-response';

export class GetAppVersion {
  static readonly type = '[Config] Get App Version';
  constructor(public options?: ActionOptions) {}
}

export class GetAppVersionSuccess {
  static readonly type = '[Config] Get App Version Success';
  constructor(public payload: AppConfig) {}
}

export class GetAppVersionFailure {
  static readonly type = '[Config] Get App Version Failure';
  constructor(public payload: string) {}
}

export class SetLoading {
  static readonly type = '[Config] Set Loading';
  constructor(public payload: boolean) {}
}

export class SetError {
  static readonly type = '[Config] Set Error';
  constructor(public payload: string | null) {}
}

export class ClearConfig {
  static readonly type = '[Config] Clear Config';
}

export class CompareAppVersion {
  static readonly type = '[Config] Compare App Version';
  constructor(public payload: { localVersion: string; serverVersion: string }) {}
}

export class VersionMismatch {
  static readonly type = '[Config] Version Mismatch';
  constructor(public payload: { localVersion: string; serverVersion: string; mismatchType: 'outdated' | 'newer' }) {}
}
